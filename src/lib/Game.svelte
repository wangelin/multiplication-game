<script>
  import { onMount, tick } from "svelte";
  import { random, fifty_fifty, range } from "./utils.js";
  import { fly } from "svelte/transition";
  import {
    score_store,
    mistake_store,
    stars_store,
    streak_store,
    game_type_store,
    selected_levels_store,
  } from "./store.js";
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let selected_levels = $selected_levels_store;
  $: {
    $selected_levels_store = selected_levels;
    new_turn();
  }

  const INACTIVATE_FOCUS = 0;
  async function focus_to(node) {
    active = node;
    if (!document.hasFocus()) return;
    if (INACTIVATE_FOCUS) return;
    if (!node) return;
    await tick();
    node.focus();
  }

  let stars = $stars_store;
  $: {
    $stars_store = stars;
  }
  $: stars_arr = range(1, stars);
  let streak = $streak_store;
  $: {
    $streak_store = streak;
  }
  let highest_streak = 0;
  $: {
    if (streak > highest_streak) highest_streak = streak;
    if (streak > 0 && streak % 5 === 0) stars++;
  }

  let score = $score_store;
  $: {
    $score_store = score;
  }
  let mistake = $mistake_store;
  $: {
    $mistake_store = mistake;
  }

  let pep_talk_timeout = null;
  let pep_talk = "";
  function pep(text, ms = 5000) {
    if (pep_talk_timeout) clearTimeout(pep_talk_timeout);
    pep_talk = text;
    pep_talk_timeout = setTimeout(() => {
      pep_talk = "";
    }, ms);
  }

  let a;
  let b;
  let answer;
  let input_a, input_b, input_answer;

  let active;

  let game_type = $game_type_store; // 1, 2 or 3
  $: {
    $game_type_store = game_type;
    new_turn();
  }

  onMount(() => {
    new_turn();
  });

  let current_level;
  function new_turn() {
    let prev_a = a,
      prev_b = b,
      prev_answer = answer;
    let select_game_type = game_type;
    if (select_game_type !== 1 && select_game_type !== 2) {
      select_game_type = random([1, 2]);
    }
    let max_times = 10,
      i = 0;
    do {
      i++;
      if (select_game_type === 1) {
        if (fifty_fifty()) {
          a = random();
          b = random(selected_levels);
          current_level = b;
        } else {
          a = random(selected_levels);
          current_level = a;
          b = random();
        }
        answer = "";
        focus_to(input_answer);
      }
      if (select_game_type === 2) {
        let new_a = random();
        let new_b = random(selected_levels);
        current_level = b;
        if (fifty_fifty()) {
          a = "";
          b = new_b;
          focus_to(input_a);
        } else {
          a = new_b;
          b = "";
          focus_to(input_b);
        }
        answer = new_a * new_b;
      }
    } while (
      i < max_times &&
      ((a === prev_a && b === prev_b) || answer === prev_answer)
    );
  }

  function check() {
    if (
      input_a.value === "" ||
      input_b.value === "" ||
      input_answer.value === ""
    )
      return;
    if (
      input_a.valueAsNumber * input_b.valueAsNumber ===
      input_answer.valueAsNumber
    ) {
      score++;
      streak++;
      if (streak % 5 === 0) {
        pep(`WOW! 🤩 ${streak} rätt i rad nu! Du är ju grym! 🙌🥳`);
      }
      new_turn();
    } else {
      if (active === input_a || active === input_b) {
        if (
          input_a.valueAsNumber * input_answer.valueAsNumber ===
          input_b.valueAsNumber
        ) {
          pep(
            `Det stämmer att ${input_a.valueAsNumber} × ${input_answer.valueAsNumber} = ${input_b.valueAsNumber}, men det var inte frågan 😜`
          );
        }
        if (
          input_b.valueAsNumber * input_answer.valueAsNumber ===
          input_a.valueAsNumber
        ) {
          pep(
            `Det stämmer att ${input_b.valueAsNumber} × ${input_answer.valueAsNumber} = ${input_b.valueAsNumber}, men det var inte frågan 😜`
          );
        }
      }
      mistake++;
      streak = 0;
      switch (active) {
        case input_a:
          {
            let right_answer =
              input_answer.valueAsNumber / input_b.valueAsNumber;
            let close = Math.abs(input_a.valueAsNumber - right_answer) === 1;
            let text = `Rackarns! ${right_answer} × ${input_b.valueAsNumber} = ${input_answer.valueAsNumber} var rätt svar.`;
            if (close && input_a.valueAsNumber > 5) {
              text = text + ` ${a} var ju supernära, bara 1 ifrån!`;
            }
            pep(text, 10_000);
            a = "";
          }
          break;
        case input_b:
          {
            let right_answer =
              input_answer.valueAsNumber / input_a.valueAsNumber;
            let close = Math.abs(input_b.valueAsNumber - right_answer) === 1;
            let text = `Rackarns! ${input_a.valueAsNumber} × ${right_answer} = ${input_answer.valueAsNumber} var rätt svar.`;
            if (close && input_a.valueAsNumber > 5) {
              text = text + ` ${a} var ju supernära, bara 1 ifrån!`;
            }
            pep(text, 10_000);
            b = "";
          }
          break;
        case input_answer:
          {
            let right_answer = input_a.valueAsNumber * input_b.valueAsNumber;
            let text = `Hoppsan! Det blev visst fel 😁 Du svarade ${input_answer.valueAsNumber} men rätt svar var ${right_answer}.`;
            let close =
              Math.abs(input_answer.valueAsNumber - right_answer) <=
              current_level;
            if (close)
              text += ".. men det var ju rätt nära om man säger så! 👍";
            pep(text, 10_000);
            answer = "";
          }
          break;
      }
      active.text = "";
    }
  }

  function handle_input(e) {
    if (pep_talk) pep_talk = "";
  }

  function handle_keydown(e) {
    if (e.key === "Escape") {
      switch (active) {
        case input_a:
          a = "";
          break;
        case input_b:
          b = "";
          break;
        case input_answer:
          answer = "";
          break;
      }
    }
  }
</script>

<div class="m-10">
  <p class="mb-4 text-xl">Jag vill öva på:</p>

  <div class="flex flex-wrap gap-4">
    {#each levels as level}
      <label class="bg-gray-200 p-4 flex gap-4 items-center text-lg">
        <span>{level}</span>
        <input
          type="checkbox"
          bind:group={selected_levels}
          value={level}
          class="rounded-md"
        />
      </label>
    {/each}
  </div>

  <div class="flex flex-col gap-2 my-4 text-lg">
    <label>
      <input type="radio" bind:group={game_type} value={1} />
      <span>Jag vill svara på tal 🙂</span>
    </label>
    <label>
      <input type="radio" bind:group={game_type} value={2} />
      <span>Jag vill skriva tal 🤔</span>
    </label>
    <label>
      <input type="radio" bind:group={game_type} value={3} />
      <span>Jag vill både skriva och svara! 🙌</span>
    </label>
  </div>

  <form on:submit|preventDefault={check} class="flex gap-4 items-center">
    <input
      class="input"
      class:active={active === input_a}
      disabled={active !== input_a}
      type="number"
      on:input={handle_input}
      on:keydown={handle_keydown}
      bind:this={input_a}
      bind:value={a}
      min="1"
    />
    <span class="symbol">×</span>
    <input
      class="input"
      class:active={active === input_b}
      disabled={active !== input_b}
      type="number"
      on:input={handle_input}
      on:keydown={handle_keydown}
      bind:this={input_b}
      bind:value={b}
      min="1"
    />
    <span class="symbol">=</span>
    <input
      class="input"
      class:active={active === input_answer}
      disabled={active !== input_answer}
      type="number"
      on:input={handle_input}
      on:keydown={handle_keydown}
      bind:this={input_answer}
      bind:value={answer}
      min="1"
    />
    <button class="btn">Svara</button>
  </form>

  {#if pep_talk}
    <div class="pep-talk" transition:fly>
      {pep_talk}
    </div>
  {/if}

  {#if stars > 10}
    <span class="symbol">⭐{stars}</span>
  {:else}
    <div class="stars">
      {#each stars_arr as star}
        <span class="symbol">⭐</span>
      {/each}
    </div>
  {/if}

  <h3 class="text-2xl font-semibold mt-4">
    Streak: {#key streak}<span class="inline-block" in:fly={{ y: -20 }}
        >{streak}</span
      >{/key}
  </h3>

  <div class={score + mistake > 0 ? "" : "hidden"}>
    <h3 class="text-2xl font-semibold mt-4">Antal rätt</h3>

    <p class="score">
      {#key score}<span class="inline-block" in:fly={{ y: -20 }}>{score}</span
        >{/key}
      rätt av
      {#key score + mistake}<span class="inline-block" in:fly={{ y: -20 }}
          >{score + mistake}</span
        >{/key}
      möjliga.
    </p>

    <button
      on:click={() => {
        score = 0;
        mistake = 0;
        streak = 0;
        stars = 0;
      }}
      class="btn mt-4 !bg-purple-500 hover:!bg-purple-400"
    >
      Räkna från början
    </button>
  </div>
</div>

<style lang="postcss">
  .active {
    @apply outline-pink-400;
  }
  [type="text"],
  [type="email"],
  [type="url"],
  [type="password"],
  [type="number"],
  [type="date"],
  [type="datetime-local"],
  [type="month"],
  [type="search"],
  [type="tel"],
  [type="time"],
  [type="week"],
  [multiple],
  textarea,
  select {
    @apply text-center text-2xl h-20 w-20 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-pink-500;
  }

  [type="checkbox"],
  [type="radio"] {
    @apply h-6 w-6 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-pink-500;
  }
  .symbol {
    @apply font-mono text-4xl;
  }
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  .btn {
    @apply bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded;
  }
</style>
