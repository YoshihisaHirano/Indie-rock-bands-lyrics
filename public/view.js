  const container = document.getElementById('container');
  const bandContainer = document.getElementById('leftSide');
  const infoContainer = document.getElementById('rightSide');
  const infobox = document.getElementById('infobox');

  async function getBands() {

    const resp = await getResponse('/api');

    resp.bands.map((elt, index) => {
      const band = document.createElement('h3');
      band.id = elt.id;
      band.textContent = elt.name;
      band.class = 'bandList';
      band.style.cursor = 'pointer';
      bandContainer.appendChild(band);

      bandNodesArr.push(band);
    })

  }
