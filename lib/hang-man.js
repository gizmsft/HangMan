; (function ($, window, document, undefined) {
  "use strict";

  const pluginName = "hangMan";

  var defaults = {
    code: "",
    riddle: {
      hint: "",
      fragments: [],  // { length: 0 }
      revealed: []  // "A"
    },
    allowedTries: 5,
    events: {
      onCharacterGuessed: function (event) {
        console.log("on character guessed");
      },
      onCompleted: function() {
        console.log("on game completed");
      },
      onGameLost: function() {
        console.log("on game lost");
      }
    },
    callbacks: {
      renderTriesLabel: function (event) {
        return "Tries: " + event.tries + "/" + event.allowedTries;
      }
    },
    css: {
      gameMainContainerClass: "game-main-container",
      hintContainerClass: "game-hint-container",
      gamePanelContainerClass: "game-panel-container",
      gamePanelClass: "game-panel",
      gamePanelRowClass: "game-panel-row",
      gamePanelCellClass: "game-panel-cell",
      gameTriesContainerClass: "game-tries-container",
      wrongGuessContainerClass: "wrong-guess-container",
      wrongGuessPanelClass: "wrong-guess-panel",
      wrongGuessPanelCellClass: "wrong-guess-panel-cell",
      keyboardContainerClass: "keyboard-container",
      keyboardPanelClass: "keyboard-panel",
      keyboardPanelRowClass: "keyboard-panel-row",
      keyboardPanelCellClass: "keyboard-panel-cell",
      keyboardPanelCellWrongClass: "keyboard-panel-cell-wrong",
      keyboardPanelCellRightClass: "keyboard-panel-cell-right",
    },
    keyboardKeys: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"]
    ]
  };

  function HangMan(element, options) {

    const $target = (element instanceof jQuery) ? element : $(element);
    const self = this;

    var local = {
      settings: null,
      completed: false
    };

    local.settings = $.extend(true, {}, defaults, options);

    var $gameMainContainer = $("<div class='" + local.settings.css.gameMainContainerClass + "'></div>");
    var $hintContainer = $("<div class='" + local.settings.css.hintContainerClass + "'></div>").appendTo($gameMainContainer);
    var $gamePanelContainer = $("<div class='" + local.settings.css.gamePanelContainerClass + "'></div>").appendTo($gameMainContainer);
    var $gameTriesContainer = $("<div class='" + local.settings.css.gameTriesContainerClass + "'></div>").appendTo($gameMainContainer);
    var $gameWrongGuessContainer = $("<div class='" + local.settings.css.wrongGuessContainerClass + "'></div>").appendTo($gameMainContainer);
    var $keyboardContainer = $("<div class='" + local.settings.css.keyboardContainerClass + "'></div>").appendTo($gameMainContainer);

    $hintContainer.append(local.settings.riddle.hint);

    // game panel rendering
    var $gamePanel = $("<div class='" + local.settings.css.gamePanelClass + "'></div>").appendTo($gamePanelContainer);
    var $gamePanelRowTemplate = $("<div class='" + local.settings.css.gamePanelRowClass + "'></div>");
    var $gamePanelCellTemplate = $("<div class='" + local.settings.css.gamePanelCellClass + "'></div>");

    $.each(local.settings.riddle.fragments, function (y, item) {
      var row = $gamePanelRowTemplate.clone().appendTo($gamePanel);
      for (var x = 0; x < item.length; x++) {
        var $cell = $gamePanelCellTemplate.clone().appendTo(row);
        $cell.data("x", x).data("y", y);
      }
    });

    // wrong panel rendering
    var $wrongGuessPanel = $("<div class='" + local.settings.css.wrongGuessPanelClass + "'></div>").appendTo($gameWrongGuessContainer);
    var $wrongGuessCellTemplate = $("<div class='" + local.settings.css.wrongGuessPanelCellClass + "'></div>");

    // keyboard panel rendering
    var $keyboardPanel = $("<div class='" + local.settings.css.keyboardPanelClass + "'></div>").appendTo($keyboardContainer);
    var $keyboardPanelRowTemplate = $("<div class='" + local.settings.css.keyboardPanelRowClass + "'></div>");
    var $keyboardPanelCellTemplate = $("<button class='" + local.settings.css.keyboardPanelCellClass + "'></button>");

    $.each(local.settings.keyboardKeys, function (i, item) {
      var row = $keyboardPanelRowTemplate.clone().appendTo($keyboardPanel);
      $.each(item, function (j, item2) {
        var $cell = $keyboardPanelCellTemplate.clone().appendTo(row);
        $cell.append(item2).data("key", item2).on("click", function () {
          if (isMarkedCompleted()) return;
          var $this = $(this);
          if ($this.hasClass(local.settings.css.keyboardPanelCellWrongClass)) return;
          if ($this.hasClass(local.settings.css.keyboardPanelCellRightClass)) return;
          if (local.settings.events.onCharacterGuessed) {
            local.settings.events.onCharacterGuessed({ char: $this.data("key") });
          }
        });
      });
    });

    $gameTriesContainer.empty().append(local.settings.callbacks.renderTriesLabel({
      tries: 0,
      allowedTries: local.settings.allowedTries
    }));

    $target.append($gameMainContainer);

    $(function() {
      $.each(local.settings.riddle.revealed, function(i, item) {
        $keyboardPanel.find("." + local.settings.css.keyboardPanelCellClass).filter(function (i, e) {
          return $(e).data("key") == item;
        }).trigger("click");
      })
    });

    function markCompleted() {
      local.completed = true;
      //$gameRiddleContainer.find("input").prop("disabled", true);
    }

    function isMarkedCompleted() {
      return local.completed;
    }

    function validateGuess(char, answer) {
      var result = { char: char, isValid: false, correct: [] };
      for (var y = 0; y < answer.length; y++) {
        for (var x = 0; x < answer[y].length; x++) {
          var altChar = compareChar(char, answer[y][x]);
          if (altChar) {
            result.correct.push({ char: char, alt: altChar, x: x, y: y });
          }
        }
      }
      result.isValid = !!result.correct.length;
      return result;
    }

    function compareChar(char, answerChar) {
      if (char == answerChar) {
        return char;
      }
      var altKeys = $.grep(local.settings.keyboardAlts, function (item) {
        return item.key == char;
      });
      if (altKeys.length) {
        var arr = altKeys[0].alts;
        for (var x = 0; x < arr.length; x++) {
          if (arr[x] == answerChar) {
            return answerChar;
          }
        }
      }
      return null;
    }

    function update(result) {
      if (result.isValid) {
        $.each(result.correct, function (i, item) {
          var $cell = $gamePanel.find("." + local.settings.css.gamePanelCellClass).filter(function (i, e) {
            return $(e).data("x") == item.x && $(e).data("y") == item.y
          });
          if (!$cell.data("key")) {
            $cell.data("key", result.char).append(item.alt);
            $keyboardPanel.find("." + local.settings.css.keyboardPanelCellClass).filter(function (i, e) {
              return $(e).data("key") == result.char;
            }).addClass(local.settings.css.keyboardPanelCellRightClass);
          }
        });
        var $cells = $gamePanel.find("." + local.settings.css.gamePanelCellClass);
        var $inComplete = $cells.filter(function (i, e) {
          return !$(e).data("key");
        });
        if ($cells.length && !$inComplete.length) {
          markCompleted();
          if (local.settings.events.onCompleted) {
            setTimeout(local.settings.events.onCompleted, 1);
          }
        }
      } else {
        var $cells = $wrongGuessPanel.find("." + local.settings.css.wrongGuessPanelCellClass);
        var $cellExists = $cells.filter(function (i, e) {
          return $(e).data("key") == result.char;
        });

        if ($cellExists.length) {
          return;
        }

        $wrongGuessCellTemplate.clone().append(result.char).data("key", result.char).appendTo($wrongGuessPanel);

        $keyboardPanel.find("." + local.settings.css.keyboardPanelCellClass).filter(function (i, e) {
          return $(e).data("key") == result.char;
        }).addClass(local.settings.css.keyboardPanelCellWrongClass);

        var $allCells = $wrongGuessPanel.find("." + local.settings.css.wrongGuessPanelCellClass);
        if ($allCells.length >= local.settings.allowedTries) {
          markCompleted();
          if (local.settings.events.onGameLost) {
            setTimeout(local.settings.events.onGameLost, 1);
          }
        }

        $gameTriesContainer.empty().append(local.settings.callbacks.renderTriesLabel({
          tries: $allCells.length,
          allowedTries: local.settings.allowedTries
        }));
      }
    }

    return {
      update: update,
      validateGuess: validateGuess,
      markCompleted: markCompleted,
      isMarkedCompleted: isMarkedCompleted,
    };
  }

  HangMan.prototype = {
    update: function () {
      update();
    },
    validateGuess: function () {
      validateGuess();
    },
    markCompleted: function () {
      markCompleted();
    },
    isMarkedCompleted: function () {
      return isMarkedCompleted();
    }
  }

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, pluginName)) {
        var plugin = new HangMan(this, options);
        $.data(this, pluginName, plugin);
      }
    });
  }

})(jQuery, window, document);
