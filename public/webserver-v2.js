import "preact/debug";
import { render } from "preact";
import { html, Component } from "htm/preact";
import { useEffect, useState } from 'preact/hooks';

//import "minstyle/styles.scss";

// To do
// https://github.com/preactjs/preact-devtools
// for live
//import "preact/devtools";


function control(entity) {
  if ( entity.entity === 'xfan' || entity.entity === 'switch' ||  entity.entity === 'light')
    return html`<button class="ms-btn ms-primary ms-outline ms-small" onClick=${() => restAction(entity,'toggle')}>Toggle</button>`
    if ( entity.entity === 'fan')
    return html`<button class="ms-btn ms-primary ms-outline ms-small  mr-1" onClick=${() => restAction(entity,'turn_on')}>On</button>
    <button class="ms-btn ms-primary ms-small" 
    onClick=${() => restAction(entity,'turn_off')}>Off</button>`
    if ( entity.entity === 'cover')
    return html`<button class="ms-btn ms-primary ms-outline ms-small  mr-1" onClick=${() => restAction(entity,'open')}>Open</button>
    <button class="ms-btn ms-primary ms-small mr-1" onClick=${() => restAction(entity,'close')}>Close</button>    
    <button class="ms-btn ms-primary ms-small" onClick=${() => restAction(entity,'stop')}>Stop</button>`    
    return html``
}

function restAction(entity,action) {
  fetch(`/${entity.entity}/${entity.id}/${action}`, {
    method: "POST",
    body: "true",
  }).then((r) => {
    console.log(r);
  });
}

class App extends Component {
  constructor() {
    super();
    const source = new EventSource("/events");
    //const [fetched, setFetched] = useState(null);
    
    //this.entities= []; // hacked in: defined in index
    //const { entities = [] } = this.state;
    //this.setState({    entities: window.entities || []    });

    /*
    const entityByid = this.entities.reduce((map, entity) => {
      map[`${entity.entity}-${entity.id}`] = entity;
      return map;
    }, {});
    */
    const entityByid = {};

    source.addEventListener("state", (e) => {
      const { entities = [] } = this.state;
      
      const data = JSON.parse(e.data); //'{"id":"number-template_number","state":"nan","value":NaN}' invalid json
      let ref = entityByid[data.id];
      if (ref) {
        ref.state = data.state;
        ref.value = data.value;
      } else {
        // Dynamically add discovered..
        console.log(`discovered:${data.id}`);
        let parts = data.id.split("-");
        let entity = {
          entity: parts[0],
          id: parts[1],
          state: data.state,
          value: data.value,
          name: data.name || data.id,
          icon: data.icon
        };
        entities.push(entity);
        entityByid[data.id] = entity;
        this.setState({
          entities: entities
        });
      }
    });
    source.addEventListener("log", (e) => {
      let parts = e.data.slice(10, e.data.length - 4).split(":");
      const debug = {
        "[1;31m": "e",
        "[0;33m": "w",
        "[0;32m": "i",
        "[0;35m": "c",
        "[0;36m": "d",
        "[0;37m": "v",
      };
      const record = {
        sort: debug[e.data.slice(0, 7)],
        level: e.data.slice(7, 10),
        tag: `${parts[0]}:${parts[1]}`,
        detail: parts[2],
        when: new Date().toTimeString().split(" ")[0],
      };
      this.addLog(record);
    });
  }

  addLog(log) {
    const { logs = [] } = this.state;

    logs.unshift(log);
    this.setState({
      logs: logs.slice(0,10)
    });
  }

  render({ page }, { logs = [], entities = [] }) {
    return html`
      <article class="container">
        <h1>${document.title}</h1>

        <table class="ms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${entities.map(
              (entity) =>
                html`
                  <tr>
                    <td>${entity.name}</td>
                    <td>${entity.state}</td>
                    <td><${control} ...${entity}/></td>
                  </tr>
                `
            )}
          </tbody>
        </table>

        <table id="log" class="ms-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>level</th>
              <th>tag</th>
              <th style="width:50%">detail</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(
              (log) =>
                html`
                  <tr class="${log.sort}">
                    <td>${log.when}</td>
                    <td>${log.level}</td>
                    <td>${log.tag}</td>
                    <td><pre>${log.detail}</pre></td>
                  </tr>
                `
            )}
          </tbody>
        </table>

        <h2>OTA Update</h2>
        <form method="POST" action="/update" enctype="multipart/form-data">
          <input type="file" name="update" />
          <input type="submit" value="Update" />
        </form>
      </article>
      
    `;
  }
}
render(html`<${App} page="All" />`, document.body);
