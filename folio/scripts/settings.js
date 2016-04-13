// Object used to store a few runtime settings
var settings = {
  resizeWidth: 640,
  displayAll: $('#display-box').prop('checked')
};

// Animation settings
var animating = {
  now: false,
  delay: 200,
  inTime: 600,
  outTime: 1200,
  hiddens: [],
  dones: []
};

// Names and paths of plays for the autocomplete
var plays = [{
  value: "Hamlet", 
  path: "plays/hamlet.html"
}, {
  value: "Macbeth", 
  path: "plays/macbeth.html"
}, {
  value: "A Midsummer Night's Dream", 
  path: "plays/midsummer.html"
}, {
  value: "The Tempest", 
  path: "plays/tempest.html"
}, {
  value: "Twelfth Night", 
  path: "plays/twelfth-night.html"
}, {
  value: "Winter's Tale", 
  path: "plays/winters-tale.html"
}];


// CSS location and button toggles for different presets
var styles = {

  modern: {
    path: 'styles/modern.css',
    toggles: [
      'direction-linebreak',
      'character-linebreak',
      'character-caps',
      'paragraph-linebreak',
      'punctuation-bold',
      'punctuation-whitespace',
      'line-numbers'
    ]
  },

  original: {
    path: 'styles/original.css',
    toggles: [
      /* TODO */
    ]
  },

  night: {
    path: 'styles/night.css',
    toggles: [
      'direction-linebreak',
      'character-linebreak',
      'character-caps',
      'paragraph-linebreak',
      'punctuation-bold',
      'punctuation-whitespace',
      'line-numbers',
      'syllable-numbers'
    ]
  }
};
