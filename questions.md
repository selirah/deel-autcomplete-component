## Question 1

What is the difference between Component and PureComponent? Give an example where it might break my app.

## Answer

A **Component** will always trigger a re-render even when the values of `state` or `props` have been updated with the same values.

**PureComponent** does not re-render when the value of `props` and `state` has been updated with the same values by performing **shallow comparison** of its state and props. They can be used in optimization to prevent unnecessary re-rendering of components.

Here is an instance where using a **Component** in a wrong way can break an app: consider the code snippet below:

```
import React, { useState } from 'react'

const ItemComponent = ({ item, onToggleItem }) => {

  // code to re-render component on every prop change
  console.log("Re-render this component")

  return (
    <div className="item-styling">
      <p>{item.name}</p>
      <p>{item.isSold ? "Sold" : "Available"}</p>
      <button onClick={() => onToggleItem(item.id)}>Sell/Unsell</button>
    </div>
  )
}

const App = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", isSold: false},
    { id: 2, name: "Item 2", isSold: false}
    ]);

    const onToggleItem = (id) => {
      setItems((prevItems) => prevItems.map((item) => item.id === id ?
      { ...item, isSold: !item.isSold } : item));
    }

    return (
      <div>
        <h1>List of Items</h1>
        {
          items.map((item) => (
            <ItemComponent key={item.id} item={item} onToggleItem={onToggleItem} />
          ))
        }
      </div>
    )
}

export default App;
```

In the example, when a user clicks on the `Sell/Unsell` button of an item, it calls the `onToggleItem` function in the parent component to update the `isSold` property of that particular item in the list. Now, if the `ItemComponent` is designed to re-render on receiving new props, anytime the state of `App` changes using the `onToggleItem` function, it will trigger a re-render of all the `ItemComponent` even if their data remains the same causing performance issues.

Here is an instance where using a **Pure Component** in a wrong way can break an app: consider the code snippet below:

```
import React, { useState } from 'react'

const ItemComponent = React.memo({ item, onToggleItem }) => {

  // code to re-render component on every prop change
  console.log(`Item ${item.name} re-rendered`)

  return (
    <div className="item-styling">
      <p>{item.name}</p>
      <p>{item.isSold ? "Sold" : "Available"}</p>
      <button onClick={() => onToggleItem(item.id)}>Sell/Unsell</button>
    </div>
  )
}

const App = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", isSold: false},
    { id: 2, name: "Item 2", isSold: false}
    ]);

    const onToggleItem = (id) => {
      setItems((prevItems) => prevItems.map((item) => item.id === id ?
      { ...item, isSold: !item.isSold } : item));
    }

    return (
      <div>
        <h1>List of Items</h1>
        {
          items.map((item) => (
            <ItemComponent key={item.id} item={item} onToggleItem={onToggleItem} />
          ))
        }
      </div>
    )
}

export default App;
```

In the example, `ItemComponent` is a pure component using the `React.memo` HOC to surround it. This memoizes the component's props to prevent unnecessary re-renders when the props are not changed. The issue comes in when an item property is toggled using the `onToggleItem` function to change the `isSold` property of the item. Because pure components does shallow comparison of the props,it will not re-render even though it has changed since `isSold` property is found inside an object `item`. In effect, the property value is changed all right, but it won't reflect on the UI.

## Question 2

Context + ShouldComponentUpdate might be dangerous. Why is that?

## Answer

**shouldComponentUpdate** is a React lifecycle method that gives the developer the ability to determine when a component should perform re-rendering for optimization reasons.

**Context** provides the ability to share data across components without using props.

Using **Context** and **shouldComponentUpdate** can cause complicated issues related to how a component re-renders and update states. Here are some examples:

- Excessive use of `shouldComponentUpdate` can lead to complicated and incorrect code such as components not updating when they should and vice versa.
- A change in data structure of components can cause unnecessary re-rendering since `shouldComponentUpdate` depends on the values of certain state and props and therefore needs to be factored in when writing the logic.
- Excessive use of `Context` can make it difficult to understand to flow of data across components leading to complex code logic.
- Unnecessary re-rendering of components when a value changes in `Context`. It can trigger all components that are connected to it to re-render.

## Question 3

Describe 3 ways to pass _information_ from a component to its PARENT.

## Answer

Information can be passed from child components to their parent components using:

- **Props** - a callback function can be passed to a child component as a prop and the child passes down the information as an argument in the callback function to the parent.
  <br>
  Example:

```
  import React, { useState } from 'react';
  import MyChildComponent from './MyChildComponent';

  const MyParentComponent = () {
    const [data, setData] = useState('');

    const handleData = (data) => {
      setData(data);
    };

    return (
      <div>
        <MyChildComponent onHandleData={handleData} />
        <p>Data from Child: {dataFromChild}</p>
      </div>
    );
  }
```

```
  import React from 'react';

  function MyChildComponent({ onHandleData }) {

    const handleClick = () => {
      const data = 'Child component information';
      onHandleData(data);
    };

    return (
      <div>
        <button onClick={handleClick}>Send Info to Parent</button>
      </div>
    );
  }
```

- **React Context API** - creating a global `state` and `functions` and making it accessible to components in the DOM and providing the ability for these components to modify the state using these global functions.
  <br>
  Example
  <br>

```
  import React, { createContext, useState } from 'react';
  import MyChildComponent from './MyChildComponent';

  const MyContext = createContext();

  function MyParentComponent() {
    const [data, setData] = useState('');

    return (
      <MyContext.Provider value={{ data, setData }}>
        <MyChildComponent />
        <p>Data from Child Component: {data}</p>
      </MyContext.Provider>
    );
  }
```

```
  import React, { useContext } from 'react';
  import MyContext from './MyContext';

  function MyChildComponent() {
    const { data, setData } = useContext(MyContext);

    const handleClick = () => {
      const data = 'Info from child';
      setData(data);
    };

    return (
      <div>
        <button onClick={handleClick}>Pass Info to Parent</button>
      </div>
    );
  }
```

- **State Management Libraries** - such as Redux, Mobx, etc. provides avenue to manage application state globally and independently of component tree. State management libraries involves creating `actions` to be `dispatched` by child components and then processed and updated by the `reducers` for the parent component to `subscribe` to the changes in the store.
  <br>
  Example
  <br>

```
  import React from 'react';
  import { useSelector } from 'react-redux';

  function MyParentComponent() {
    const { childData } = useSelector((state) => state);

    return (
      <div>
        <MyChildComponent />
        <p>Data from Child: { childData }</p>
      </div>
    );
  }

```

```
  import React from 'react';
  import { useDispatch } from 'react-redux';
  import { setChildData } from '../redux/actions';

  function MyChildComponent() {
    const dispatch = useDispatch();

    const handleClick = () => {
      const data = 'Info from Child';
      dispatch(setChildData(data));
    };

    return (
      <div>
        <button onClick={handleClick}>Pass Info to Parent</button>
      </div>
    );
  }

```

## Question 4

Give 2 ways to prevent components from re-rendering.

## Answer

React Components can be prevented from re-rendering by using:

- `Memoization` - using a higher-order component (HOC) such as `React.memo` to memoize a component's state and props, preventing it from unnecessary re-renders when there hasn't been any change in the component's state or props. The `useMemo` hook also memoizes the result from a function computation and returns the memoized value if the dependencies to the function remains the same (using Referential equality).
  <br>
  Example:

  ```
  import React from 'react';

  const MyComponent = React.memo(({ prop1, prop2 }) => {
    return (
      <div>
        <p>Prop 1: {prop1}</p>
        <p>Prop 2: {prop2}</p>
      </div>
    );
  });
  ```

  The component **MyComponent** in the example given will re-render only if **prop1** or **prop2** changes.

- `Lifecycle methods` - using a lifecycle method such as `shouldComponentUpdate` to control when a component should re-render. A developer can write a custom logic inside this lifecycle method to only re-render a component based on certain conditions.
  <br>
  Example:

```
  import React, { Component } from 'react';

  class MyComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
      // Implement logic
      return nextProps.prop1 !== this.props.prop1
      || nextProps.prop2 !== this.props.prop2;
    }

    render() {
      return (
        <div>
          {/* JSX */}
        </div>
      );
    }
  }

```

## Question 5

What is a fragment and why do we need it? Give an example where it might break my app.

## Answer

Fragments can be used to avoid unnecssary addition of extra node to the DOM by grouping multiple child components. They are denoted by either using **<React.Fragment>...</React.Fragment>**" or by using the short form "**<>...</>**".
<br>
Example:

```
import React from 'react';
const MyComponent = () => {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
};

```

<br>
Fragments are needed to:

- keep the HTML structure cleaner and more efficient as no unnecessary node is added to the DOM.
- render list of items without the need to enclose them in a parent element.

<br>
Example where using Fragments can break an app. Condider the code snippet below:

```
import React from 'react';

const MyComponent = () => {
  const showTitle = true;

  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
    </>
  );
};

```

In this example, both `<h1>` and `<p>` are sibling elements. If a developer decides to style both with say a margin, it will lead to an unexpected result because there is no enclosing element around them. The styling can only take effect if the developer encloses the elements with a `<div>` or its equivalent sibling.

## Question 6

Give 3 examples of the HOC pattern.

## Answer

Higher-Order Components (HOCs) are functions that takes a component as an argument and return an enhanced version of that component. They are design pattern in React used to extend the functionality of a component by wrapping it with another component.

Higher-Order Components (HOCs) are functions that receives another component as an argument and return an updated version of that component.
<br>
Examples of HOC pattern used in React:

- `Auth HOC` for adding authentication functionality to components to check if a user is authenticated. If true, the component is rendered, else, the user can be redirected to a another page such as the login page.

```
  import React from 'react';
  import { Redirect } from 'react-router-dom

  const withAuth = (WrappedComponent) => {
    const isAuth = isUserAuthenticated();

    const AuthComponent = (props) => {
      if (isAuth) {
        return <WrappedComponent {...props} />
      } else {
        return <Redirect to="/login />
      }
    }

    return AuthComponent;
  };

  const MyComponent = ({ loggedUser }) => {
    return <div>Hello, { loggedUser.username }</div>;
  };

  export default withAuth(MyComponent);

```

- `Loading HOC` to add a loading indicator to a component. It displays a loading message whiles fetching or processing the data.

```
  import React, { useEffect, useState} from 'react';

  const withLoading = (WrappedComponent) => {

    const LoadingComponent = (props) => {
      const [isLoading, setLoading] = useState(true);
      useEffect(() => {
        // Simulate loading data from an API
        // or performing some async operation
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }, [])

      return isLoading ? <p>Loading...</p> : <WrappedComponent {...this.props} />
    }

    return LoadingComponent;
  };

  const MyComponent = () => {
    return <div>Data Loaded Successfully</div>;
  };

  export default withLoading(MyComponent);

```

- `Styles HOC` used to apply common style such as theme to a set of components to allow code reuse and consistency.

```
  import React from 'react';


  const withStyles = (WrappedComponent) => {
    const styles = {
      backgroundColor: '#fafafa',
      fontSize: '14px',
      color: '#000000'
    };

    const StyledComponent = (props) => {
      return <WrappedComponent {...props} style={styles} />
    }

    return StyledComponent;
  };

  const MyComponent = () => {
    return <div>Component with Styling</div>;
  };

  export default withStyles(MyComponent);

```

## Question 7

What's the difference in handling exceptions in promises, callbacks and async…await?

## Answer

- `Promises` - exceptions are handled using the `.catch()` method. They are able to "catch" errors that are "thrown" or rejected by the `.then()` method.

```
  myPromiseFn()
    .then((result) => {
      // Resolved promise here
    })
    .catch((error) => {
      // Rejected promise here
    });

```

- `Callbacks`, exceptions are handled as the first argument in the callback function.

```
  function myCallbackFn(callback) {
    // Asynchronous operation here
    if (error) {
      callback(new Error('Error occured));
    } else {
      callback(null, data);
    }
  }

  myCallbackFn((error, result) => {
    if (error) {
      // Handle error
    } else {
      // Handle result
    }
  });

```

- `async...await` exceptions are handled in a `try...catch` block.

```
  async function myAsyncFn() {
    try {
      const result = await somePromiseFn();
      // resolved Promise here
    } catch (error) {
      // rejected Promise here
    }
  }

```

## Question 8

How many arguments does setState take and why is it async.

## Answer

The `setState` method in React is used to update the state of a component, and it takes two arguments: an **object** or a **function** and an optional **callback** function.

- `object` or a `function`:

```
  this.setState({ key1: value1, key2: value2 });
```

```
  this.setState((prevState, props) => {
    // Use prevState to calculate and return new state
    return { key1: value1, key2: value2 };
  });
```

- optional `callback`

```
  this.setState({ key1: value1 }, () => {
    // Code to be executed after the state update and re-render
  });

```

The `setState` is async because it does not immediately update states and trigger re-rendering of component. It rather stores up all updates in batches and performs a single re-render to improve performance.

## Question 9

List the steps needed to migrate a Class to Function Component.

## Answer

- Remove lifecycle methods e.g. `componentDidMount` and replace with hooks such as `useEffect`.
- Remove `constructor` in the Class component.
- Replace `state` object with the `useState` hook.
- Convert Class component methods to regular functions.
- Remove the `this` reference.
- Remove the `render()` method.
- Test the new Function component.

## Question 10

List a few ways styles can be used with components.

## Answer

There are several ways to use styles in components. The following are some common approaches:

- **Inline Styles** - apply styles directly to JSX elements.

```
  const MyComponent = () => {
    const styles = {
      color: 'blue',
      fontSize: '16px',
      fontWeight: 'bold',
    };

    return <div style={styles}>Inline styled component</div>;
  };

```

- **CSS Modules** - create separate CSS file for each component and import and apply the styles to their corresponding components.

```
  // MyComponent.module.css
  .container {
    color: blue;
    font-size: 16px;
    font-weight: bold;
  }
```

```
  // MyComponent.js
  import React from 'react';
  import styles from './MyComponent.module.css';

  const MyComponent = () => {
    return <div className={styles.container}>Styled component with CSS Modules</div>;
  };

```

- **CSS-in-JS** - such as `styled-components` library allows developers to write CSS directly inside JavaScript code using tagged template literals.

```
  import React from 'react';
  import styled from 'styled-components';

  const StyledDiv = styled.div`
    color: blue;
    font-size: 16px;
    font-weight: bold;
  `;

  const MyComponent = () => {
    return <StyledDiv>Styled component with Styled Components</StyledDiv>;
  };

```

- **External CSS** - import CSS file into component or the main application file.

```
// styles.css
  .my-style {
    color: red;
    font-size: 16px;
  }

```

```
// MyComponent.js
  import React from 'react';
  import './styles.css';

  const MyComponent = () => {
    return <div className="my-style">Component with external CSS</div>;
  };

```

## Question 11

How to render an HTML string coming from the server.

## Answer

Rendering HTML string that is received from a server can be achieved by:

- Making sure the HTML content comes from a trusted source and therefore safe.
- Use the `dangerouslySetInnerHTML` prop to render the HTML string.

```
  import React from 'react';

  const MyComponent = () => {
    // HTML string received from a trusted server
    const htmlString = '<p>This is an HTML string from the server.</p>';

    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  export default MyComponent;

```
