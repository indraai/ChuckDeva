// Copyright (c)2022 Quinn Michaels
// The Chuck Deva who tells Chuck Norris jokes.

const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const CHUCK = new Deva({
  agent: {
    uid: agent.uid,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse(input) {
      return input.trim();
    }
  },
  vars,
  listeners: {},
  modules: {},
  deva: {},
  func: {
    /**************
    func: joke
    params: none
    describe: Return a Chuck Norris Joke.
    ***************/
    joke() {
      const joke = {
        text:[],
        data: {}
      }
      return new Promise((resolve, reject) => {
        // ask web deva for the url data.
        this.question(`#web get ${this.vars.url}`).then(chuck => {
          this.vars.joke = this.agent.parse(this.lib.decode(chuck.a.data.value.joke));
          joke.text.push(`${this.vars.joke}`);
          joke.data.chuck = chuck.a.data
          return this.question(`#feecting parse:${this.agent.key} ${joke.text.join('\n')}`)
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: joke.data,
          });
        }).catch(err => {
          return this.error(err, false, reject);
        })
      });
    },
  },
  methods: {
    /**************
    method: joke
    params: packet
    describe: Call the joke function to return a Chuck Norris joke.
    ***************/
    joke(packet) {
      return this.func.joke(packet);
    },

    /**************
    method: uid
    params: packet
    describe: Call the core unique id feature.
    ***************/
    uid(packet) {
      return Promise.resolve({text:this.uid()});
    },

    /**************
    method: status
    params: packet
    describe: Return current status of the Chuck Deva.
    ***************/
    status(packet) {
      return this.status();
    },

    /**************
    method: help
    params: packet
    describe: Call the Chuck Deva help file and then parse it through the
    feecting deva before return.
    ***************/
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
          return this.question(`#feecting parse ${help}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(reject);
      });
    }
  },
});
module.exports = CHUCK
