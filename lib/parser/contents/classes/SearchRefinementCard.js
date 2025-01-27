'use strict';

const NavigationEndpoint = require('./NavigationEndpoint');
const Thumbnail = require('./Thumbnail');
const Text = require('./Text');

class SearchRefinementCard {
  type = 'searchRefinementCardRenderer';

  constructor(data) {
    this.thumbnail = new Thumbnail(data.thumbnail).thumbnails;
    this.endpoint = new NavigationEndpoint(data.searchEndpoint);
    this.query = new Text(data.query);
  }
}

module.exports = SearchRefinementCard;