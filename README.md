# Rextate

⚛️ Another React state management but made easy.

<br >

🚨 **IMPORTANT:** Rextate is still a pre-release.

<br >
<br >


[![npm version](https://badge.fury.io/js/re-xtate.svg)](https://badge.fury.io/js/re-xtate)
[![TypeScript](https://img.shields.io/npm/types/re-xtate)](https://img.shields.io/npm/types/re-xtate)
[![issues](https://img.shields.io/github/issues/builtbyedgar/re-xtate)](https://img.shields.io/github/issues/builtbyedgar/re-xtate)
[![license](https://img.shields.io/github/license/builtbyedgar/re-xtate)](https://img.shields.io/github/license/builtbyedgar/re-xtate)
<!-- [![npm version](https://badge.fury.io/js/re-xtate.svg)](https://badge.fury.io/js/re-xtate) -->


## Instalation

```bash
npm i re-xtate
// or
yarn add re-xtate
```

### Decentralized model

The chosen model for designing the library is the decentralized model. In this model, many
small states are decoupled from the React tree, allowing components to connect only to the
states they use. Examples of libraries that follow this model are [Recoil](https://recoiljsorg/)
and [Jōtai](https://github.com/pmndrs/jotai/).

The main idea behind this approach is to decentralize and atomize global states, effectively
separating the data layer from the visualization layer. This offers several benefits:

- An easy-to-use API.
- No need for a Context wrapper or prop drilling.
- Compatibility with React 18 Concurrent Mode.
- Support for computed states.
- Faster and simpler code-splitting.
- Extensibility with middleware or plugins.

Additionally, the library supports Redux dev tools via middleware! 😎

### `globalState`

To create global states, we use the `globalState` method, which has the following API:

- `initialValue: T`: the initial value of the global state.
- `actionCreator?: ActionCreator<T, A>`: a function that creates actions to modify the state.
- `config?: Config`: a configuration object.

Let's create some simple global states and see how to access and modify their values.

```ts
const countState = globalState(0, null, { key: 'count' })

const loadingState = globalState(false, null, { key: 'loading' })

const todosState = globalState(
  [
    { id: '3485-owjx-f3f9', task: 'Become a JS ninja', status: 'PENDING' },
    { id: '93764-sgdf-0464', task: 'Make more friends', status: 'PENDING' },
    { id: '2342-adha-9442', task: 'Clean my home', status: 'PENDING' },
  ],
  null,
  { key: 'todos' }
)

// get states
countState.get()
loadingState.get()
todosState.get()

// update states
countState.set(10)
loadingState.set(true)
todosState.set((todos) => [
  ...todos,
  { id: '2342-adha-9442', task: 'Clean my home', status: 'COMPLETED' },
])
```

In the example above, we define three global states: `countState`, `loadingState`, and `todosState`.
We initialize them with their initial values and specify a unique key for each state. To retrieve the
current values of the states, we use the `get()` method on each state. And to update the states, we
use the `set()` method, passing the new value directly or providing a callback function to modify the
existing value.

### `useGlobalState`

To subscribe to a global state within our components, we can utilize the `useGlobalState` hook. However,
if we only need to obtain the value of a global state without causing our component to re-render,
we can still use the `get` method of our state.

Here's an example of how to use the `useGlobalState` hook:

```tsx
const todos = useGlobalState(todosState)
...

<div>
  {todos.map((todo) => (
    <li key={todo.id}>
      <p>{todo.task}</p>
      ...
    </li>
  ))}
</div>
```

### State actions

The `actions` object defines the methods we will use to update our states. We can think of them as
the Redux actions.

```ts
const countState = globalState(
  0,
  // Actions
  (set, get) => ({
    // Action to increase value
    increment: () => set((count) => count + 1),
    decrement: () => set((count) => count - 1),
    reset: () => set(0),
  }),
  { key: 'count' }
)

// Now we can use them
countState.actions.increase()
countState.actions.decrease()
countState.actions.reset()

// We can destruct them to make them more convenient to use.
export const { increase, decrease, reset } = countState.actions
increase()
decrease()
reset()
```

In the code above, we define the actions object within the `globalState` method. It contains methods
that allow us to update the state. In this example, we have increment, decrement, and reset actions
for the `countState`.

To use these actions, we call them using the actions property of the state, like `countState.actions.increment()`.
This will update the state accordingly.

Alternatively, and as I personally suggest, we can destructure the actions from the actions object, making them
more convenient to use directly, as shown in the example. This allows us to use the actions directly as `increment()`,
`decrement()`, and `reset()`.

### `globalComputed`

**Rextate**, derived states are referred to as "computed" states, and we can create them using the
`globalComputed` method. Computed states cache their value and recalculate it only when any of the states or
computes states they depend on change. Think of them as something similar to React's `useMemo` hook.

`globalComputed` has the following API:

- `state: State<T, A>`: the states it depends on.
- `actionCreator: ActionCreator<T, A>`: function that creates the actions to recalculate the state.
- `config?: Config`: Config: configuration object.

```ts
// globalComputed
const totalTodos = globalComputed(todosState, (todos) => todos.length)

const completedTodos = globalComputed(todosState, (todos) =>
  todos.filter((todo) => todo.completed)
)

// Depends on one state and another computed state.
const todoStats = globalComputed(
  totalTodos,
  completedTodos,
  (total, completed) => ({
    done: completed.length,
    percent: (completed.length / done) * 100,
  })
)
```

In the example above, we define three computed states: `totalTodos`, `completedTodos`, and `todoStats`.
`totalTodos` calculates the total number of todos from the `todosState`, while completedTodos filters
the `todosState` to get only the completed todos. `todoStats` depends on both the `totalTodos` state
and the `completedTodos` computed state, and it calculates the number of completed todos and the percentage of completion.

We can use computed states just like regular states:

```ts
const { done, percent } = useGlobalState(todoStats)

totalTodos.get()
completedTodos.get()
```

### Async states

Handling asynchronous states is straightforward. Simply call the `set()` method when you need
to update the state asynchronously.

```ts
const todoState = state([])

async function getTodos(url: string) {
  const response = await fetch(url)
  const json = await response.json()

  set(json)
}

// We can also create async actions
const todosState = state([], (set) => ({
  fetch: async (url) => {
    const response = await fetch(url)
    const json = await response.json()

    set(json)
  },
}))
```

### Accessing other states and selectors within the `actions`.

We can access other states and selectors from our actions, although if you want to maintain a clean, pure and side-effect-free state management
pure, clean and without side-effects, you may not need it.

```ts
const loadingState = globalState(false, null, { key: 'loading' })

const todosState = globalState(
  [{ id: '3485-owjx-f3f9', task: 'Become a JS ninja', status: 'PENDING' }],
  (set) => ({
    add: () => {
      loadingState.set(true)

      try {
        // fetch todos and update the state
      } catch (error) {
        // catch the error
      } finally {
        loadingState.set(false)
      }
    },
  }),
  { key: 'todos' }
)
```

In the code above, we have an example of handling asynchronous states. The `todoState` is a
simple state that can be updated using the set method.

We also define a function `getTodos` that performs an asynchronous operation, such as fetching
data from a URL, and updates the todoState using the set method.

Additionally, we demonstrate the creation of async actions within the `todosState`. The `todosState`
has an action called fetch that fetches data from a specified URL and updates the state accordingly.

##### Project status

- [ ] Logo
- [ ] Examples
  - [x] Basic (counter)
  - [x] Async (fetch)
  - [x] Todo list
  - [ ] Nested selectors (selector(state, selector, otherSelector, () => ....))
  - [ ] Estress test (50.000 todo's)
  - [ ] Persist middleware
- [x] Refactor (API, improvemnts)
- [ ] Testing
- [-] Docs
- [x] Publish on NPM [npm](https://www.npmjs.com/package/re-xtate)
