<script>
  export let quote = '';
  export let source = '';
</script>

<figure class="quote-block">
  <blockquote>
    “{quote}”
  </blockquote>
  <figcaption>{source}</figcaption>
</figure>

<style>
  .quote-block {
    max-width: 44rem;
    margin: 2rem auto;
    padding: 1.5rem;
    background: white;
    border-left: 4px solid #ff70a6;
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  }

  blockquote {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.5;
  }

  figcaption {
    margin-top: 0.8rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }
</style>
