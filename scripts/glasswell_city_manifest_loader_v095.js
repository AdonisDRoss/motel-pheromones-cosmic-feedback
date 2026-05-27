// GLASSWELL_CITY_MANIFEST_LOADER_v095
// Non-destructive helper. Include this from index.html only after testing.
// It does not remove old assets. It reads assets/maps/dust9/glasswell/glasswell_city_manifest_v095.json.

window.GLASSWELL_CITY = {
  manifestPath: "assets/maps/dust9/glasswell/glasswell_city_manifest_v095.json",

  async loadManifest() {
    const res = await fetch(this.manifestPath + "?v=095");
    if (!res.ok) throw new Error("Could not load Glasswell manifest: " + res.status);
    this.manifest = await res.json();
    return this.manifest;
  },

  getChunk(id) {
    if (!this.manifest) throw new Error("Glasswell manifest not loaded yet.");
    return this.manifest.chunks.find(c => c.id === id);
  },

  preloadChunk(scene, chunk) {
    scene.load.image(`${chunk.id}_base`, chunk.layers.base);
    scene.load.image(`${chunk.id}_fg`, chunk.layers.foreground_overlay);
    scene.load.image(`${chunk.id}_mask`, chunk.layers.collision_mask);
  },

  addChunk(scene, chunk, visible = false) {
    const x = chunk.grid.worldX;
    const y = chunk.grid.worldY;
    const base = scene.add.image(x, y, `${chunk.id}_base`).setOrigin(0, 0).setDepth(0);
    const fg = scene.add.image(x, y, `${chunk.id}_fg`).setOrigin(0, 0).setDepth(9000);
    base.setVisible(visible);
    fg.setVisible(visible);
    return { base, fg };
  }
};
