import { render } from "preact";
import { html, Component } from "htm/preact";

// C:\Users\rhys\source\repos\wmr\examples\demo\public\pages\meta-tags.js
// C:\Users\rhys\source\repos\wmr\examples\demo\public\pages\json.js

class App extends Component {
  constructor() {
    super();
    const source = new EventSource("/events");
    
    const entityByid = entities.reduce((map, entity) => {
      map[`${entity.entity}-${entity.id}`] = entity;
      return map;
    }, {});
  
    source.addEventListener("state", function (e) {
      const data = JSON.parse(e.data);
      let ref=entityByid[data.id];
      if ( ref ) {
        ref.state=data.state;
        ref.value=data.value;
      } else {
        // Dynamically add discovered..
        console.log(`discovered:${data.id}`)
        let parts=data.id.split('-')
        let entity = {
          entity: parts[0],
          id: parts[1],
          state: data.state,
          value: data. value,
          name: data.id
        };
        entities.push(entity);
        entityByid[data.id]=entity;
      }
    });
    source.addEventListener("log", (e) => {
      let parts=e.data.slice(10,e.data.length-4).split(':');
      const record =  {
        sort: e.data.slice(0,7),
        level: e.data.slice(7,4),
        who: `${parts[0]}:${parts[1]}`,
        detail: parts[2],
        when: (new Date).toTimeString().split(' ')[0]
    };
      this.addLog(record);
    });
  }

  addLog(log) {
    const { logs = [] } = this.state;

    logs.unshift(log);
    this.setState({ logs: logs });
  }

  toggle(entity) {
    fetch(`/${entity.entity}/${entity.id}/toggle`, { method: "POST", body: 'true' }).then((r) => {
      console.log(r);
    });
  }

  render({ page }, { logs = [] }) {
    return html`
      <article>
        <h1>${document.title}</h1>
        <h2>States</h2>

        <table>
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
                    <td><button onClick=${() => this.toggle(entity)}>Toggle</button></td>
                  </tr>
                `
            )}
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>sort</th>
              <th>level</th>
              <th>who</th>
              <th style="width:50%">detail</th>
            </tr>
            </thead>
          <tbody>
          ${logs.map((log) => html` <tr><td>${log.when}</td><td>${log.sort}</td><td>${log.level}</td><td>${log.who}</td><td>${log.detail}</td></tr> `)}
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
/*
source.addEventListener("log", function (e) {
  const log = document.getElementById("log");
  let klass = "";
  if (e.data.startsWith("[1;31m")) {
    klass = "e";
  } else if (e.data.startsWith("[0;33m")) {
    klass = "w";
  } else if (e.data.startsWith("[0;32m")) {
    klass = "i";
  } else if (e.data.startsWith("[0;35m")) {
    klass = "c";
  } else if (e.data.startsWith("[0;36m")) {
    klass = "d";
  } else if (e.data.startsWith("[0;37m")) {
    klass = "v";
  } else {
    log.innerHTML += e.data + "\n";
  }
  log.innerHTML += '<span class="' + klass + '">' + e.data.substr(7, e.data.length - 10) + "</span>\n";
});
*/

render(html`<${App} page="All" />`, document.body);
