<script>
  export let id = '';
  export let eyebrow = '';
  export let title = '';
  export let intro = '';
</script>

<section {id} class="section">
  <div class="heading">
    <p class="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <p class="intro">{intro}</p>
  </div>

  <div class="content">
    <slot />
  </div>
</section>

<style>
  .section {
    padding: 6rem 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  .heading {
    max-width: 56rem;
    margin: 0 auto 2rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.8rem;
    color: #a04b78;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1;
    margin: 0;
    max-width: 14ch;
  }

  .intro {
    max-width: 44rem;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-top: 1rem;
  }
</style>
