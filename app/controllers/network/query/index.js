import Ember from 'ember';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  // Session is now automatically injected everywhere
  // session: Ember.inject.service('session'),

  cpvModalIsOpen: false,
  optionsModalIsOpen: false,

  selectedCodes: Ember.A([]),

  rangeIsDisabled: Ember.computed('query.countries', function(){
    return !this.get('query.countries').length;
  }),

  countries: [],
  yearsStart: [],

  yearsRange: Ember.computed('years', function () {
      let yearMin = _.minBy(this.get('years'), 'id').id;
      let yearMax = _.maxBy(this.get('years'), 'id').id;

      this.set('yearsStart', [yearMin,yearMax]);

      return {'min': yearMin, 'max' : yearMax};
  }),

  height: window.innerHeight - 200,

  network: {},

  query: {
    'nodes': 'count',
    'edges': 'count',
    'rawCountries': [],
    'countries': [],
    'years': [2004, 2010],
    'cpvs': []
  },

  jsTree: {
    core: {
      'themes': {
        'url': '/assets/photonui/style.css',
        'name': 'photonui',
      }
    },
    plugins: 'checkbox, search, contextmenu',
    searchOptions: { 'show_only_matches' : true },
    checkbox : {
      "three_state" : true
    }
  },
  searchTerm: '',

  prepareQuery() {
    let self = this;
    self.get('selectedCodes').forEach((v) => {
      self.get('query.cpvs').push(v.id);
    });
  },

  actions: {

    onSelectEvent(value) {
      this.set('query.countries', []);
      value.forEach((v) => {
        this.get('query.countries').push(v.id);
      });

      // this.set('query.country_ids', value);
      // this.prepareQuery();

      let options = this.get('query.countries').length && `{
        "query": {
            "countries": ["${this.get('query.countries').join('", "')}"]
        }
      }`;
      this.get('ajax')
          .post('/contracts/years', { data: options, headers: { 'Content-Type': 'application/json' } })
          .then((data) => {
            this.set('years', data.search.results);
          });
    },

    slidingAction(value) {
      // Ember.debug( "New slider value: %@".fmt( value ) );
      // this.controller.set('years', value[0]);
      this.set('query.years', []);
      this.get('query.years').push(value[0]);
      this.get('query.years').push(value[1]);
      Ember.run.scheduleOnce('afterRender', function() {
        Ember.$('span.left-year').text(value[0]);
        Ember.$('span.right-year').text(value[1]);
      });
      this.set('query.years', _.range(this.get('query.years')[0], ++this.get('query.years')[1]));




    },

    toggleCpvModal() {
      Ember.$('.cpv-modal-open').css('pointer-events', 'none');
      let self = this;
      let options = `{
        "query": {
            "countries": ["${self.get('query.countries').join('", "')}"],
            "years": [${self.get('query.years').join(', ')}]
        }
      }`;

      this.get('ajax')
        .post('/contracts/cpvs', { data: options, headers: { 'Content-Type': 'application/json' } })
        .then((data) => {
          self.set('cpvs', data.search.results);
          this.toggleProperty('cpvModalIsOpen');
          Ember.$('.cpv-modal-open').css('pointer-events', 'inherit');
        });

      console.log(this.get('selectedCodes'));
    },

    toggleOptionsModal() {
      this.toggleProperty('optionsModalIsOpen');
    },

    submitQuery() {
      let self = this;

      // // self.send('loading');

      self.notifications.info('This is probably going to take a while...', {
        autoClear: false
      });

      self.set('isLoading', true);
      self.prepareQuery();

      this.get('store').createRecord('network', {
        options: {
          nodes: this.get('query.nodes'),
          edges: this.get('query.edges')
        },
        query: {
          cpvs: this.get('query.cpvs').uniq(),
          countries: this.get('query.countries').uniq(),
          years: this.get('query.years').uniq()
        }
      }).save().then((data) => {
        // self.send('finished');
        // self.transitionToRoute('network.query.show', data.id)
        self.set('isLoading', false);
        self.toggleProperty('optionsModalIsOpen');
        self.transitionToRoute('network.show', data.id);
      }).catch((data) => {
        // TODO: Catch the actual reason sent by the API (for some reason it's not pulled in, will check later)
        console.log(`Error: ${data}`);
        self.set('isLoading', false);
        self.notifications.clearAll();
        self.notifications.error('You need to <a href="/">sign in</a> or <a href="/">sign up</a> before continuing.', {
          htmlContent: true,
          autoClear: false
        });
      });
    },

    invalidateSession() {
      this.get('session').invalidate();
    }
  }
});
