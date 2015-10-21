Packaging [Pikaday](https://github.com/dbushell/Pikaday) for [Meteor.js](http://meteor.com).

Temporary fork is [wzoom:Pikaday](https://github.com/wzoom/Pikaday), but I proposed [PR](https://github.com/dbushell/Pikaday/pull/385) to dbushell to make the original project meteor-packaged. Vote for the PR!


# Meteor

If you're new to Meteor, here's what the excitement is all about -
[watch the first two minutes](https://www.youtube.com/watch?v=fsi0aJ9yr2o); you'll be hooked by 1:28.

That screencast is from 2012. In the meantime, Meteor has become a mature JavaScript-everywhere web
development framework. Read more at [Why Meteor](http://www.meteorpedia.com/read/Why_Meteor).


# Usage

Ideally instantiate inside `onRendered` template hook. 

```javascript
Template.xxxxx.onRendered(function() {

  this.picker = new Pikaday({
    field: document.getElementById('datepicker'),
  });
});

```


# Issues

If you encounter an issue while using this package, please file an issue in this repo.


# DONE

* Simple test.


# TODO

* Add release script, ie. auto-propagation of information from `package.json` to `package.js` and deployment to [AtmosphereJS](https://atmospherejs.com).
