<script>
  export let story;
</script>

<section class="hero">
  <div class="inner">
    <p class="kicker">{story.meta.kicker}</p>
    <h1>{story.meta.title}</h1>
    <p class="dek">{story.meta.description}</p>
    <div class="meta">
      <span>{story.meta.author}</span>
      <span>{story.meta.context}</span>
    </div>
  </div>
</section>

<style>
  .hero {
    min-height: 80vh;
    display: grid;
    place-items: end start;
    padding: 5rem 1.5rem 3rem;
    background:
      linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35)),
      radial-gradient(circle at 20% 20%, rgba(255, 112, 166, 0.35), transparent 35%),
      radial-gradient(circle at 80% 30%, rgba(255, 196, 61, 0.35), transparent 30%),
      #1a1a1a;
    color: white;
  }

  .inner {
    max-width: 56rem;
  }

  .kicker {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.8rem;
    opacity: 0.85;
  }

  h1 {
    font-size: clamp(3rem, 9vw, 7rem);
    line-height: 0.95;
    margin: 0.3rem 0 1rem;
    max-width: 10ch;
  }

  .dek {
    max-width: 42rem;
    font-size: clamp(1.05rem, 2vw, 1.4rem);
    line-height: 1.5;
  }

  .meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
    font-size: 0.95rem;
    opacity: 0.9;
  }
</style>
