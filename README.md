# jQuery Chaos

  A dynamic mess organizer plugin
       
  **Live Example:** [http://tulios.github.com/jquery.chaos/](http://tulios.github.com/jquery.chaos/)
  
## Dependencies

* [jQuery](http://jquery.com) 1.7.2
* [Modernizr Transform3d](https://github.com/tulios/jquery.chaos/blob/master/dependency/modernizr.transforms3d.js)

## Usage

```javascript
$("#container").chaos();
```

```html
<div id="container">
  <div class="atom small" style="left: 10px; top: 30px;">Text 1</div>
  <div class="atom big" style="left: 20px; top: 20px;">Text 2</div>
</div>
```

```css
#container {
  position: relative;
}

.atom {
  position: absolute;
}

.atom.effect {
  -webkit-transition-property: -webkit-transform, opacity, height;
  -moz-transition-property: -moz-transform, opacity, height;
  -o-transition-property: -o-transform, opacity, height;
  -ms-transition-property: -ms-transform, opacity, height;
  transition-property: transform, opacity, height;

  -webkit-transition-duration: 0.8s;
  -moz-transition-duration: 0.8s;
  -o-transition-duration: 0.8s;
  -ms-transition-duration: 0.8s;
  transition-duration: 0.8s;
}
```

### How to organize the container?

```javascript
$("#container").chaos().organize();
```

### How to invert the order of organization?

```javascript
$("#container").chaos().organize({order: "reverse"});
```

### How to get back to the original format?

```javascript
$("#container").chaos().original();
```

### How to filter by css classes?

```css
.atom.hide {
  opacity: 0;
}
```

```javascript
$("#container").chaos().organize({
  selector: ".small",
  beforeAnimation: function() {
    $(".atom").addClass("hide");
    $(".small").removeClass("hide");
  }
});
```

## Plugin initialization

### Options
    
* **elementSelector** (default: ".atom"): The basic element selector
* **effectClass** (default: "effect"): The effect class
* **padding** (default: 10): The amount of padding added during an element organization
* **columnWidth** (default: null): The column width is calculated based on the small element. Use this option to fix the width

### Callbacks

* **beforeInitialization(element)**: Called before the element setup
* **beforeElementAnimation(element, {top: X, left: Y})**: Called before the element animation
* **beforeAnimation**: Called before starting the animation
* **afterAnimation**: Called after the animation
* **animateFunction(element, {top: X, left: Y})**: Overrides the css animation function
* **animateFallbackFunction(element, {top: X, left: Y})**: Overrides the fallback animation function

```javascript
$("#container").chaos({
  elementSelector: ".atom",
  effectClass: "effect",
  padding: 10,
  columnWidth: null,
  beforeInitialization: function(element) {
  },
  beforeElementAnimation: function(element, opts) {
  },
  beforeAnimation: function() {
  },
  afterAnimation: function() {
  },
  animateFunction: null,
  animateFallbackFunction: null
});
```

## Methods

### Getting the instance after the initialization

```javascript
$("#container").chaos();
```

### original

```javascript
$("#container").chaos().original({
  selector: "",
  beforeAnimation: function() {
  },
  afterAnimation: function() {
  }
});
```

Accepts a selector to restrict the manipulated elements. Accepts before and after callbacks.

### organize

```javascript
$("#container").chaos().organize({
  order: ""
  selector: "",
  beforeAnimation: function() {
  },
  afterAnimation: function() {
  }
});
```

Organize will invert the elements if **order: "reverse"** is used.
Accepts a selector to restrict the manipulated elements. Accepts before and after callbacks.

## Maintainers

[Túlio Ornelas](https://github.com/tulios)

## License

Copyright 2012 Túlio Ornelas. See [LICENSE](https://github.com/tulios/jquery.chaos/blob/master/LICENSE) for more details.