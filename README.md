# Reacts®

A React state management made easy

## React state management models

Currently, the models for managing the global state of React applications can be divided into two main areas:

#### Centralized

A single store combines all application states and connects to the components through a context and selectors (computed).
Examples of this model are libraries such as [Redux](https://github.com/reduxjs/redux) or [Zustand](https://github.com/pmndrs/zustand/).

#### Decentralized

Many small states decoupled from the React tree. Components only need to connect to the states they use.
Examples of this model are libraries like [Recoil](https://recoiljs.org/) or [Jōtai](https://github.com/pmndrs/jotai/).


### Decentralized Model

The idea is to decentralize and atomize the global states in order to completely decouple the data layer from the visualization layer.
from the visualization layer. This brings us numerous benefits:

- Boilerplate-free and ease-to-use API.
- No Context wrapper or prop drilling.
- React 18 Concurrent Mode compatibility.
- Memoized selectors.
- Easy to persist the application state to browser store.
- Faster and ease code-splitting.
- Extensible with middleware or plugins.

  And [Redux dev tools](https://github.com/reduxjs/redux-devtools) support via middleware! 😎

### `globalState`

To create our global states we have the `globalState` method that has the following API:

- `initialValue: T`: the initial value of the global state.
- `actionCreator?: ActionCreator<T, A>`: function that creates the actions to modify the status.
- `config?: Config`: configuration object.

Let's create some simple global states and see how to obtain and modify their values.

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


### `useGlobalState`

When we need one of our components to subscribe to one of our global states we will use the `useGlobalState` hook.
the `useGlobalState` hook.

If on the contrary we only want to obtain the value of a global state avoiding that our component is rendered
we will continue using the `get` method of our state.

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
    reset: () => set(0)
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

### `globalComputed`

We can create derived (or computed) states thanks to the `globalComputed` method, which caches its value and will only recalculate it when any of the states or selectors it depends on changes. 
recalculate it when any of the states or selectors on which it depends changes. We can think of it as
something similar to React's `useMemo` hook.

`globalComputed` has the following API:

- `state: State<T, A>`: the states it depends on.
- actionCreator: ActionCreator<T, A>`: function that creates the actions to recalculate the state.
- config: Config: configuration object.
  

```ts
// globalComputed
const totalTodos = globalComputed(todosState, (todos) => todos.length)

const completedTodos = globalComputed(todosState, (todos) => todos.filter(todo => todo.completed))

// Depends on one state and another computed state.
const todoStats = globalComputed(
  totalTodos,
  completedTodos,
  (total, completed) => ({
    done: completed.length,
    percent: (completed.length / done) * 100
  })
)
```

We can use our computations as if they were states:

```ts
const { done, percent } = useGlobalState(todoStats)

totalTodos.get()
completedTodos.get()
```

### Async states

Handling asynchronous states is no mystery. Just call `set` when you need it!

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
  }
}))
```

### Accessing other states and selectors within the `actions`.

We can access other states and selectors from our actions, although if you want to maintain a clean, pure and side-effect-free state management
pure, clean and without side-effects, you may not need it.

```ts
const loadingState = globalState(false, null, { key: 'loading' })

const todosState = globalState(
  [
    { id: '3485-owjx-f3f9', task: 'Become a JS ninja', status: 'PENDING' },
  ],
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
    }
  }),
  { key: 'todos' }
)
``` 


## TODOs

- [ ] Ejemplos
  - [x] Basico (counter)
  - [x] Asíncrono (fetch)
  - [x] Todo list
  - [ ] Nested selectors (selector(state, selector, otherSelector, () => ....))
  - [ ] Estress test (50.000 todo's)
  - [ ] Persist middleware
- [x] Refactor (API, improvemnts)
- [ ] Testing
- [ ] Docs
- [ ] Crear paquete [npm](www.npmjs.com)