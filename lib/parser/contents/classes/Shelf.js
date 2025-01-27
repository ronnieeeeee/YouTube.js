'use strict';

const Text = require('./Text');
const Parser = require('..');
const NavigationEndpoint = require('./NavigationEndpoint');

class Shelf {
  type = 'shelfRenderer';
  
  constructor(data) {
    this.title = new Text(data.title);
    this.endpoint = new NavigationEndpoint(data.endpoint);
    this.content = Parser.parse(data.content) || [];
    this.icon_type = data.icon?.iconType || null;
    this.menu = Parser.parse(data.menu);
  }
}

module.exports = Shelf;