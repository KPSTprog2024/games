document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('metadata.json');
    const data = await response.json();
    document.querySelectorAll('.dates').forEach(elem => {
      const key = elem.dataset.game;
      const meta = data[key];
      if (meta) {
        elem.innerHTML = `初回リリース: ${meta.created}<br>最終更新: ${meta.updated}`;
      }
    });
  } catch (err) {
    console.error('メタデータの読み込みに失敗しました', err);
  }
});
