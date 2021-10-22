import { render } from "preact";
import { html, Component } from "htm/preact";

// https://github.com/developit/htm

// C:\Users\rhys\source\repos\wmr\examples\demo\public\pages\meta-tags.js
// C:\Users\rhys\source\repos\wmr\examples\demo\public\pages\json.js

class App extends Component {
  addTodo() {
    const { todos = [] } = this.state;

    this.setState({ todos: todos.concat(`Item ${todos.length}`) });
    // http://aroha-garage-mini.local/switch/garage_control/toggle
    fetch("/switch/garage_control/toggle").then((r) => {
      console.log(r.json());
    });
    // const xhr = new XMLHttpRequest();
    //xhr.open("POST", '/switch/' + id.substr(7) + '/toggle', true);
    //xhr.send();
  }

  toggle(entity) {
    console.dir(entity);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/switch/${entity.id}/toggle`, true);
    xhr.send();
  }

  render({ page }, { todos = [] }) {
    return html`
      <article>
        <h1>${document.title} Web Server</h1>
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
                    ${entity.state}
                    <td></td>
                    <td><button onClick=${() => this.toggle(entity)}>Toggle ${entity.id}</button></td>
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

        <h2>Debug Log</h2>
        <pre id="log"></pre>

        <ul>
          ${todos.map((todo) => html` <li>${todo}</li> `)}
        </ul>
        <button onClick=${() => this.addTodo()}>Add Todo!</button>
      </article>
    `;
  }
}

// http://aroha-garage-mini.local/switch/garage_control/toggle

const host = "http://aroha-garage-mini.local";
const source = new EventSource(`${host}/events`);

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

source.addEventListener("state", function (e) {
  const data = JSON.parse(e.data);
  // {id: 'switch-garage_control', state: 'OFF', value: false}
  console.log(data);
  //document.getElementById(data.id).children[1].innerText = data.state;
});

render(html`<${App} page="All" />`, document.body);
