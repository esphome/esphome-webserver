import { connected } from "process";

const window_source = new EventSource("/events");

window_source.addEventListener("ping", (e) => {
  // on initial load ping contains node data - let's capture it
  if (e.data) {
    const data = JSON.parse(e.data);

    let titlediv = document.getElementById("t");
    if (!titlediv) {
      // if another node joins, we should not create another title node
      titlediv = document.createElement("div");
      document.body.prepend(titlediv);
      titlediv.id = "t";
    }

    // fill in title node data
    titlediv.innerHTML = `<b>${data.title} - ${data.comment}</b>`;
  }
});

window_source.addEventListener("state", (e) => {
  const data = JSON.parse(e.data);
  
  // get the row associated with the element id
  let datarow = document.getElementById(data.id);

  // create row if missing
  if (!datarow) {
    datarow = document.createElement("tr");
    datarow.id = data.id;
    datarow.innerHTML = `<td>${data.name}</td><td></td>`;
    document.getElementById("m")!.append(datarow);
  }

  // update row data element
  (datarow.childNodes[1] as HTMLElement).innerHTML = data.state ?? "-";
});
