'use strict';

const { InnertubeError } = require('../../utils/Utils');
const Format = require('./classes/Format');
const VideoDetails = require('./classes/VideoDetails');

/** @namespace */
class AppendContinuationItemsAction {
  type = 'appendContinuationItemsAction';
    
  constructor (data) {
    this.continuation_items = Parser.parse(data.continuationItems);
  }
}

/** @namespace */
class Parser {
  static parseResponse(data) {
    return {
      contents: Parser.parse(data.contents),
      on_response_received_actions: data.onResponseReceivedActions && Parser.parseRR(data.onResponseReceivedActions) || null,
      on_response_received_endpoints: data.onResponseReceivedEndpoints && Parser.parseRR(data.onResponseReceivedEndpoints) || null,
      on_response_received_commands: data.onResponseReceivedCommands && Parser.parseRR(data.onResponseReceivedCommands) || null,
      metadata: Parser.parse(data.metadata),
      header: Parser.parse(data.header),
      /** @type {import('./classes/PlayerMicroformat')} **/
      microformat: data.microformat && Parser.parse(data.microformat),
      sidebar: Parser.parse(data.sidebar),
      overlay: Parser.parse(data.overlay),
      refinements: data.refinements || null,
      estimated_results: data.estimatedResults || null,
      player_overlays: Parser.parse(data.playerOverlays),
      playability_status: data.playabilityStatus && {
        /** @type {number} */
        status: data.playabilityStatus.status,
        /** @type {boolean} */
        embeddable: data.playabilityStatus.playableInEmbed || null,
        /** @type {string} */
        reason: data.reason || ''
      },
      streaming_data: data.streamingData && {
        expires: new Date(Date.now() + parseInt(data.streamingData.expiresInSeconds) * 1000),
        /** @type {import('./classes/Format')[]} */
        formats: Parser.parseFormats(data.streamingData.formats),
        /** @type {import('./classes/Format')[]} */
        adaptive_formats: Parser.parseFormats(data.streamingData.adaptiveFormats),
        dash_manifest_url: data.streamingData?.dashManifestUrl || null,
        dls_manifest_url: data.streamingData?.dashManifestUrl || null,
      },
      captions: Parser.parse(data.captions),
      video_details: data.videoDetails && new VideoDetails(data.videoDetails),
      annotations: Parser.parse(data.annotations),
      storyboards: Parser.parse(data.storyboards),
      /** @type {import('./classes/Endscreen')} */
      endscreen: Parser.parse(data.endscreen),
      /** @type {import('./classes/CardCollection')} */
      cards: Parser.parse(data.cards),
    }
  }
  
  static parseRR(actions) {
    return actions.map((action) => {
      if (action.appendContinuationItemsAction)
        return new AppendContinuationItemsAction(action.appendContinuationItemsAction);
    }).filter((item) => item);
  }
  
  static parseFormats(formats) {
    return formats?.map((format) => new Format(format)) || [];
  }
  
  static parse(data) {
    if (!data)
      return null;
    
    if (Array.isArray(data)) {
      let results = [];

      for (let item of data) {
        const keys = Object.keys(item);
        const classname = this.sanitizeClassName(keys[0]);
      
        try {
          const TargetClass = require('./classes/' + classname);
          results.push(new TargetClass(item[keys[0]]));
        } catch (err) {
          this.formatError({ classname, classdata: item[keys[0]], err });
          return null;
        }
      }
      
      /**
       * Creates a trap to intercept property access
       * and add helper functions.
       */
      const proxy = new Proxy(results, {
        get (target, prop) {
          if (prop == 'get') {
            /**
             * Returns the first object to match the rule.
             * @name get
             * @param {object} rule
             */
            return (rule) => target
              .find((obj) => {
                const rule_keys = Reflect.ownKeys(rule);
                return rule_keys.some((key) => obj[key] === rule[key]);
              });
          }
          
          if (prop == 'findAll') {
            /**
             * Returns all objects that match the rule.
             * @name findAll
             * @param {object} rule
             */
            return (rule) => target
              .filter((obj) => {
                const rule_keys = Reflect.ownKeys(rule);
                return rule_keys.some((key) => obj[key] === rule[key]);
              });
          }
          
          return Reflect.get(...arguments);
        }
      });
      
      return proxy;
    } else {
      const keys = Object.keys(data);
      const classname = this.sanitizeClassName(keys[0]);
      
      try {
        const TargetClass = require('./classes/' + classname);
        return new TargetClass(data[keys[0]]);
      } catch (err) {
        this.formatError({ classname, classdata: data[keys[0]], err });
        return null;
      }
    } 
  }
  
  static formatError({ classname, classdata, err }) {
    if (err.code == 'MODULE_NOT_FOUND') 
      console.warn(
        new InnertubeError(classname + ' not found!\n' +
          'This is a bug, please report it at ' + require('../../../package.json').bugs.url,
          classdata)
        );
    else
      console.warn(
        new InnertubeError('Something went wrong at ' + classname + '!\n' +
          'This is a bug, please report it at ' + require('../../../package.json').bugs.url,
          { stack: err.stack })
        );
  }
  
  static sanitizeClassName(input) {
    return (input.charAt(0).toUpperCase() + input.slice(1))
        .replace(/Renderer|Model/g, '')
        .replace(/Radio/g, 'Mix').trim();
  }
}

module.exports = Parser;