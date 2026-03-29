<script>
  export let title = 'Visual placeholder';
</script>

<div class="viz">
  <div class="sticky-card">
    <p class="label">Visual</p>
    <h3>{title}</h3>
    <p>
      Aquest bloc està preparat perquè hi substitueixis el placeholder per un SVG,
      un gràfic en D3, un canvas o una visualització feta a mà a Figma exportada.
    </p>
    <div class="mock"></div>
  </div>
</div>

<style>
  .viz {
    max-width: 60rem;
    margin: 0 auto;
  }

  .sticky-card {
    position: relative;
    background: white;
    border-radius: 1.5rem;
    padding: 1.5rem;
    box-shadow: 0 16px 40px rgba(0,0,0,0.08);
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.75rem;
    opacity: 0.6;
  }

  h3 {
    margin: 0.3rem 0 0.8rem;
    font-size: 1.6rem;
  }

  .mock {
    margin-top: 1.25rem;
    min-height: 24rem;
    border-radius: 1rem;
    background:
      linear-gradient(90deg, rgba(255,112,166,.22), rgba(255,196,61,.22)),
      repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.03),
        rgba(0,0,0,0.03) 1px,
        transparent 1px,
        transparent 40px
      );
    border: 1px dashed rgba(0,0,0,0.12);
  }
</style>
