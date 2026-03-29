<script>
  import Hero from '$lib/components/Hero.svelte';
  import ChapterNav from '$lib/components/ChapterNav.svelte';
  import ScrollySection from '$lib/components/ScrollySection.svelte';
  import QuoteBlock from '$lib/components/QuoteBlock.svelte';
  import NetworkPlaceholder from '$lib/components/NetworkPlaceholder.svelte';
  import { story } from '$lib/data/story.js';

  const chapters = story.chapters;
</script>

<svelte:head>
  <title>{story.meta.title}</title>
  <meta name="description" content={story.meta.description} />
</svelte:head>

<div class="page">
  <Hero {story} />
  <ChapterNav items={chapters} />

  {#each chapters as chapter}
    <ScrollySection id={chapter.id} eyebrow={chapter.eyebrow} title={chapter.title} intro={chapter.intro}>
      {#if chapter.quote}
        <QuoteBlock quote={chapter.quote.text} source={chapter.quote.source} />
      {/if}

      {#if chapter.visual === 'network'}
        <NetworkPlaceholder title="Xarxa de relacions, perfils i circulació narrativa" />
      {:else if chapter.visual === 'timeline'}
        <NetworkPlaceholder title="Línia temporal d'intensificacions narratives" />
      {:else if chapter.visual === 'matrix'}
        <NetworkPlaceholder title="Matriu presencial / virtual" />
      {:else}
        <div class="text-block">
          {#each chapter.paragraphs as paragraph}
            <p>{paragraph}</p>
          {/each}
        </div>
      {/if}
    </ScrollySection>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    color: #111;
    background: #faf8f2;
  }

  .page {
    width: 100%;
  }

  .text-block {
    max-width: 44rem;
    margin: 0 auto;
    display: grid;
    gap: 1rem;
    font-size: 1.08rem;
    line-height: 1.75;
  }

  .text-block p {
    margin: 0;
  }
</style>
