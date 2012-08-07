/*!
 * jQuery Chaos
 * https://github.com/tulios/jquery.chaos
 * version: 0.1.0
 */

;(function ($, window, document, undefined) {

  $.fn.chaos = function(opts) {
    var container = $(this);

    if (!container.data("chaosInstance")) {
      var opts = $.extend({}, $.fn.chaos.options, opts);
      var instance = new Chaos(container, opts);
      container.data("chaosInstance", instance);
      return instance;
    }

    return container.data("chaosInstance");
  };

  $.fn.chaos.options = {
    unitSelector: ".atom",
    effectClass: "effect",
    padding: 10
  };

  var Chaos = function (container, opts) {
    this.container = container;
    this.opts = opts;
    this._init();
  };

  Chaos.prototype = {

    _init: function() {
      if (Modernizr.csstransforms3d) {
        var elements = this._getUnits();
        this._createProperties(elements);
        this._generateSectors(elements);
        this.setup(elements);

      } else {
        this._fallback = true;
      }
    },

    setup: function(elements, isToCreateProperties) {
      var self = this;
      elements = elements || this._getUnits();

      if (isToCreateProperties) {
        this._createProperties(elements);
      }

      elements.each(function() {
        var element = $(this);
        var props = element.data("chaosProperties");

        props.originalLeft = self._pxToInt(element.css("left"));
        props.originalTop = self._pxToInt(element.css("top"));

        self._applyTransform(this, {left: props.originalLeft, top: props.originalTop});
        element.css({left: 0, top: 0});
      });
    },

    _createProperties: function(elements) {
      elements.each(function() {
        var element = $(this);
        if (!element.data("chaosProperties")) {
          element.data("chaosProperties", {});
        }
      });
    },

    _generateSectors: function(elements) {
      this.sectorMinWidth = elements.outerWidth(true) + this.opts.padding;
      this.sectorMinHeight = elements.outerHeight(true) + this.opts.padding;

      var self = this;
      elements.each(function() {
        var element = $(this);
        var props = element.data("chaosProperties");

        var elementWidth = element.outerWidth(true) + self.opts.padding;
        var elementHeight = element.outerHeight(true) + self.opts.padding;

        props.sectorWidthUnits = Math.ceil(elementWidth / self.sectorMinWidth);
        props.sectorHeightUnits = Math.ceil(elementHeight / self.sectorMinHeight);
      });
    },

    original: function(unitSelector) {
      var self = this;
      var elements = unitSelector ? $(unitSelector) : this._getUnits();
      elements.addClass(this.opts.effectClass);

      if (!this._fallback && elements.data("chaosProperties").style !== "original") {
        elements.each(function() {
          var element = $(this);
          var props = element.data("chaosProperties");
          props.style = "original";
          self._applyTransform(this, {left: props.originalLeft, top: props.originalTop});
        });

      } else if (this._fallback) {
        elements.addClass("original");
      }
    },

    organize: function(unitSelector, order) {
      var self = this;
      var selector = this.opts.unitSelector;
      if (unitSelector && order !== undefined) {
        selector = unitSelector;

      } else {
        order = unitSelector
      }

      order = order || "forward";
      var elements = order == "forward" ? $(selector) : $($(selector).get().reverse());
      elements.addClass("effect");

      var padding = this.opts.padding;
      var left = padding;
      var higherTop = -1;

      var maxWidth = this.container.width();
      var maxHeight = this.container.height();
      var immediatelyAbove = null;
      var immediatelyAboveBuffer = [];

      if (!this._fallback && elements.data("chaosProperties").style !== "organize-" + order) {

        var modify = function(element, elementWidth) {
          element.data("chaosProperties").translatedLeft = left;
          var top = immediatelyAbove ? self._calculateTop(element, immediatelyAbove) : padding;
          element.data("chaosProperties").translatedTop = top;

          self._applyTransform(element, {left: left, top: top});
          left += elementWidth;
          immediatelyAboveBuffer.push(element);

          if (top + element.outerHeight(true) > higherTop) {
            higherTop = top + element.outerHeight(true) + self.opts.padding;
          }
        };

        elements.each(function() {

          var element = $(this);
          var props = element.data("chaosProperties");
          props.style = "organize-" + order;

          var elementWidth = element.outerWidth(true) + padding;
          var elementHeight = element.outerHeight(true) + padding;

          if (left < maxWidth && (maxWidth - left) >= elementWidth ) {
            modify(element, elementWidth);

          } else {
            immediatelyAbove = immediatelyAboveBuffer;
            immediatelyAboveBuffer = [];

            left = padding;
            modify(element, elementWidth);
          }
        });

      } else if (this._fallback) {
        elements.addClass("organize-" + order);
      }

      var minHeight = this._pxToInt(this.container.css("min-height"));
      if (minHeight < higherTop) {
        this.container.css("min-height", higherTop + "px");
      }
    },

    _calculateTop: function(element, immediatelyAbove) {
      var self = this;
      var intersections = [];

      $(immediatelyAbove).each(function() {
        var elementAbove = $(this);
        if (self._intersectsLeft(elementAbove, element)) {
          intersections.push(elementAbove.data("chaosProperties").sectorHeightUnits);
        }
      });

      var higher = this._getHigher(intersections);
      var top = higher * this.sectorMinHeight;
      if (higher === 1) {
        top += this.opts.padding;
      }

      return top;
    },

    _intersectsLeft: function(element1, element2) {
      var left1 = element1.data("chaosProperties").translatedLeft;
      var space1 = left1 + element1.outerWidth(true);

      var left2 = element2.data("chaosProperties").translatedLeft;
      var space2 = left2 + element2.outerWidth(true);

      return !(space1 < left2 || left1 > space2);
    },

    _applyTransform: function(element, opts) {
      $(element).css({
        "-webkit-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
        "-moz-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
        "-o-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
        "-ms-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
        "transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)"
      });
    },

    _getUnits: function() {
      return $(this.opts.unitSelector, this.container);
    },

    _pxToInt: function(px) {
      return parseInt(px.replace(/px$/, ""), 10);
    },

    _getHigher: function(elements) {
      return Math.max.apply(Math, elements);
    }

  };

})(jQuery, window, document, undefined);