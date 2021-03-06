import Ember from 'ember';
// import _ from 'lodash/lodash';

export default Ember.Controller.extend({
  sidebarTabs: [
    { id: 'suppliers', title: 'Suppliers' },
    { id: 'procurers', title: 'Procurers' },
    { id: 'relationships', title: 'Relationships' }
  ],
  active: 'suppliers',

  gridOptionsBoilerplate: {
    enableColResize: true,
    suppressMovableColumns: true,
    enableSorting: true,
    enableFilter: true
    // quickFilterText: 'suppliers'
  },

  gridOptions: {

    suppliers: {
      rowSelection: 'single',
      onSelectionChanged: function() {
        var selectedRows = this.api.getSelectedRows();
        this.network.moveTo(selectedRows[0].id);
        this.network.network.selectNodes([selectedRows[0].id]);
      },
      onGridSizeChanged: function() {
        this.api.sizeColumnsToFit();
      },
      onViewportChanged: function() {
        this.api.sizeColumnsToFit();
      },
      onGridReady: function() {
        this.api.sizeColumnsToFit();
      },
      columnDefs: [
        { headerName: 'ID', field: 'id' },
        { headerName: 'Name', field: 'label',
          cellStyle: { 'white-space': 'normal' }
        },
        { headerName: 'Value', field: 'value' }
      ],
      getRowHeight: (params) => {
        return 18 * (Math.floor(params.data.label.length / 25) + 1.5);
      },
      enableFilter: true
    },

    procurers: {
      rowSelection: 'single',
      onGridSizeChanged: function() {
        this.api.sizeColumnsToFit();
      },
      onViewportChanged: function() {
        this.api.sizeColumnsToFit();
      },
      onGridReady: function() {
        this.api.sizeColumnsToFit();
      },
      onSelectionChanged: function() {
        var selectedRows = this.api.getSelectedRows();
        this.network.moveTo(selectedRows[0].id);
        this.network.network.selectNodes([selectedRows[0].id]);
      },
      columnDefs: [
        { headerName: 'ID', field: 'id' },
        { headerName: 'Name', field: 'label' },
        { headerName: 'Value', field: 'value' }
      ],
      getRowHeight: (params) => {
        return 18 * (Math.floor(params.data.label.length / 25) + 1.5);
      },
      enableFilter: true
    },

    relationships: {
      rowSelection: 'single',
      onGridSizeChanged: function() {
        this.api.sizeColumnsToFit();
      },
      onViewportChanged: function() {
        this.api.sizeColumnsToFit();
      },
      onGridReady: function() {
        this.api.sizeColumnsToFit();
      },
      onSelectionChanged: function() {
        var selectedRows = this.api.getSelectedRows();
        console.log(selectedRows);
        // this.network.moveTo(selectedRows[0].from);
        this.network.network.fit({
          nodes: [selectedRows[0].from, selectedRows[0].to], 
          animation: true
        });
        this.network.network.selectEdges([selectedRows[0].id]);
      },
      columnDefs: [
        { headerName: 'Procurer', field: 'from' },
        { headerName: 'Supplier', field: 'to' },
        { headerName: 'Value', field: 'value' }
      ]
    }
  },

  onFilterChanged(value) {
    console.log(value);
    this.gridOptions.api.setQuickFilter(value);
  },

  init() {
    console.log(this);
    // this.get('gridOptions.suppliers').push(this.get('gridOptionsBoilerplate'));
    // this.set('gridOptions.suppliers.vis', this.get('network'));
    Ember.$.each(this.get('gridOptionsBoilerplate'), (k, v) => {
      this.set(`gridOptions.suppliers.${k}`, v);
      this.set(`gridOptions.procurers.${k}`, v);
      this.set(`gridOptions.relationships.${k}`, v);
    });
  },

  actions: {
    closeDetails(networkId) {
      this.transitionToRoute('network.show', networkId);
    },
    changeTab(tab) {
      this.set('active', tab);
    }
  }
});
