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
    elementSelector: ".atom",
    effectClass: "effect",
    padding: 10,
    beforeInitialization: function(element) {},
    beforeElementAnimation: function(element, opts) {},
    beforeAnimation: function() {},
    afterAnimation: function() {},
    animateFunction: null
  };

  var Chaos = function (container, opts) {
    this.container = container;
    this.opts = opts;
    this._init();
  };

  Chaos.prototype = {

    setup: function(elements) {
      var self = this;
      var elements = elements || this._getElements();

      for (var i = 0; i < elements.length; i++) {
        var element = $(elements.get(i));

        if (!element.data("chaos")) {
          element.data("chaos", {});
        }

        var props = element.data("chaos");

        props.originalLeft = this._pxToInt(element.css("left"));
        props.originalTop = this._pxToInt(element.css("top"));

        this.opts.beforeInitialization(element);

        this._applyTransform(element, {left: props.originalLeft, top: props.originalTop});
        element.css({left: 0, top: 0});
      }
    },

    original: function(params) {
      var params = $.extend({}, params);
      var elements = params.selector ? $(params.selector) : this._getElements();
      elements.addClass(this.opts.effectClass);

      if (!this._fallback && elements.data("chaos").style !== "original") {

        this._animate(function() {
          for (var i = 0; i < elements.length; i++) {
            var element = $(elements.get(i));
            var props = element.data("chaos");
            props.style = "original";
            this._applyTransform(element, {left: props.originalLeft, top: props.originalTop});
          }
        });

      } else if (this._fallback) {
        elements.addClass("original");
      }
    },

    organize: function(params) {
      var style = "organize";
      var params = $.extend({}, params);

      var reverse = params.order === "reverse";
      var elements = params.selector ? $(params.selector) : this._getElements();
      var currentStyle = elements.data("chaos").style;

      if (reverse) {
        style = "organize-reverse";
        elements = $(elements.get().reverse());
      }

      elements.addClass(this.opts.effectClass);

      if (!this._fallback && (currentStyle !== "organize" || currentStyle !== "organize-reverse")) {

        this._animate(function() {
          for (var i = 0; i < elements.length; i++) {
            var element = $(elements.get(i));
            element.data("chaos").style = style;
            this._placeElement(element);
          }
          this._resetY();
        });

      } else if (this._fallback) {
        elements.addClass(style);
      }
    },

    _init: function() {
      if (Modernizr.csstransforms3d) {
        var elements = this._getElements();
        this._calculateColumns(elements);
        this.setup(elements);

      } else {
        this._fallback = true;
      }
    },

    _resetY: function() {
      var i = this.columns;
      this.colYs = [];
      while (i--) {
        this.colYs.push(0);
      }
    },

    _calculateColumns: function(elements) {
      this.minColumnWidth = elements.outerWidth(true) + this.opts.padding;
      this.maxColumns = Math.floor(this.container.width() / this.minColumnWidth);

      this.columns = Math.floor((this.container.width() + this.opts.padding) / this.minColumnWidth);
      this.columns = Math.max(this.columns, 1);
      this._resetY();
    },

    // Borrowed and adapted from http://masonry.desandro.com/jquery.masonry.js layout logic
    _placeElement: function(element) {
      var colSpan, groupCount, groupY, groupColY;

      //how many columns does this brick span
      colSpan = Math.ceil((element.outerWidth(true) + this.opts.padding) / this.minColumnWidth);
      colSpan = Math.min(colSpan, this.maxColumns);

      if (colSpan === 1) {
        // if brick spans only one column, just like singleMode
        groupY = this.colYs;

      } else {
        // brick spans more than one column
        // how many different places could this brick fit horizontally
        groupCount = this.maxColumns + 1 - colSpan;
        groupY = [];

        // for each group potential horizontal position
        for (var j = 0; j < groupCount; j++) {
          // make an array of colY values for that one group
          groupColY = this.colYs.slice(j, j + colSpan);
          // and get the max value of the array
          groupY[j] = Math.max.apply(Math, groupColY);
        }
      }

      // get the minimum Y value from the columns
      var minimumY = Math.min.apply(Math, groupY);
      var shortCol = 0;

      // Find index of short column, the first from the left
      var len = groupY.length;
      for (var i = 0; i < len; i++) {
        if (groupY[i] === minimumY) {
          shortCol = i;
          break;
        }
      }

      // position the brick
      var position = {
        top: minimumY + this.opts.padding,
        left: this.minColumnWidth * shortCol + this.opts.padding
      };

      this._applyTransform(element, position);

      // apply setHeight to necessary columns
      var setHeight = minimumY + element.outerHeight(true) + this.opts.padding;
      var setSpan = this.columns + 1 - len;
      for ( var i=0; i < setSpan; i++ ) {
        this.colYs[shortCol + i] = setHeight;
      }
    },

    _animate: function(callback) {
      this.opts.beforeAnimation();
      callback.apply(this);
      this.opts.afterAnimation();
    },

    _applyTransform: function(element, opts) {
      this.opts.beforeElementAnimation(element, opts);
      if (!this.opts.animateFunction) {

        $(element).css({
          "-webkit-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "-moz-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "-o-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "-ms-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)"
        });

      } else {
        this.opts.animateFunction(element, opts);
      }
    },

    _getElements: function() {
      return $(this.opts.elementSelector, this.container);
    },

    _pxToInt: function(px) {
      return parseInt(px.replace(/px$/, ""), 10);
    }

  };

})(jQuery, window, document, undefined);