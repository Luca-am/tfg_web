<script>
  export let items = [];
</script>

<nav class="chapter-nav" aria-label="Capítols">
  {#each items as item, i}
    <a href={`#${item.id}`}>
      <span>{String(i + 1).padStart(2, '0')}</span>
      <strong>{item.shortTitle}</strong>
    </a>
  {/each}
</nav>

<style>
  .chapter-nav {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.9rem 1rem;
    background: rgba(250, 248, 242, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: #111;
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 999px;
    white-space: nowrap;
    background: white;
  }

  span {
    font-size: 0.8rem;
    opacity: 0.6;
  }

  strong {
    font-size: 0.9rem;
  }
</style>
