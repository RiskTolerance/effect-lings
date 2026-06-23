<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

  // Svelte 5 runes. `data` comes from the Effect-powered load; `form` from the
  // create action's result.
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Effect + SvelteKit todos</title></svelte:head>

<main>
  <h1>Todos</h1>
  <p>Loaded by an Effect in <code>+page.server.ts</code>.</p>

  <ul>
    {#each data.todos as todo (todo.id)}
      <li class:done={todo.done}>
        <span>{todo.title}</span>
        {#if todo.done}<small>✓ done</small>{/if}
      </li>
    {/each}
  </ul>

  <form method="POST" action="?/create" use:enhance>
    <input name="title" placeholder="New todo…" autocomplete="off" />
    <button type="submit">Add</button>
  </form>

  {#if form?.message}
    <p class="error">Validation failed: {form.message}</p>
  {/if}

  <p class="api">
    There's also a JSON API: <code>GET /api/todos</code> and
    <code>POST /api/todos</code> — both backed by the same Effect service.
  </p>
</main>

<style>
  main { max-width: 32rem; margin: 3rem auto; font-family: system-ui, sans-serif; }
  li.done span { text-decoration: line-through; opacity: 0.6; }
  small { color: green; margin-left: 0.5rem; }
  .error { color: crimson; }
  .api { margin-top: 2rem; color: #555; font-size: 0.9rem; }
  input { padding: 0.4rem; }
  button { padding: 0.4rem 0.8rem; }
</style>
