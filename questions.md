## Question 1

What is the difference between Component and PureComponent? Give an example where it might break my app.

## Answer

**Component** and **PureComponent** are both base classes that can be extended to create custom components. The main difference between the two lies in their handling of updates and re-rendering:

In the case of a **Component**, when a custom component extends it, it will re-render whenever it's `state` or `props` change, irrespective of whether there has been a change in the actual values or not. This means updating the component's `state` with the same values will still trigger re-render.

On the other hand, **PureComponent**, a subclass of **Component**, performs what is known as **shallow comparison** of its **state** and **props** before making a decision on whether to re-render or not. If the `props` and `state` are the same (i.e., same references), the component will not re-render. PureComponent provides optimization behavior to prevent unnecessary re-renders in certain cases.

Here is an example of how using PureComponent might break an app:

```
  import React, { Component, PureComponent } from 'react';

  class ExampleComponent extends PureComponent {
    render() {
      console.log('Rendering ExampleComponent');
      return <div>{this.props.message}</div>
    }
  }

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        message: "Hello world"
      }
    }

    componentDidMount() {
      setInterval(() => {
        // Since we are resuing the same state object,
        // PureComponent will not re-render ExampleComponent
        this.setState({ message: "Hello world" });
      }, 1000)
    }

    render() {
      console.log("Rendering App");
      return <ExampleComponent message={this.state.message} />;
    }
  }
```

In the example above, **ExampleComponent** extends **PureComponent** and **App** renders **ExampleComponent** with the prop `message`. The **App** component uses `setInterval` method to update its state every second with the same `message` value ("Hello world") in the `setState` method. Since **PureComponent** performs a shallow comparison of `props`, it will not trigger re-render of **ExampleComponent** when `message` remains the same.

The issue comes from the fact that the `setInterval` updates the `state`, but **ExampleComponent** will never re-render because the `message` prop never changes its reference, only its value. Using **PureComponent** in this case is not appropriate because we may want the **ExampleComponent** to re-render when the `message` prop changes, regardless of its reference.

## Question 2

Context + ShouldComponentUpdate might be dangerous. Why is that?

## Answer

**shouldComponentUpdate** is a React lifecycle method that allows us to manually control whether a component should re-render or not. It is used in optimization to prevent unnecessary re-renders.

**Context** provides a way to share data between components without the need for passing props down intermediate components.

Using **Context** + **shouldComponentUpdate** can lead to unexpected issues related to a component's updates and re-rendering. Some of which includes the following:

- Using **shouldComponentUpdate** excessively can lead to complex logic, making code harder to maintain, understand and debug.
- Using both **shouldComponentUpdate** and **Context** together can introduce additional dependenices and considerations on when a component should update, making the component more tightly coupled to the specific context, becoming a challenge in predicting how changes in the context will affect the components' behavior.
- When **shouldComponentUpdate** and **Context** are mixed, there might be issues of propagating updates to the components. When a component's update depends on a context, the component might not re-render properly when there is a change in the context, leading to inconsistencies and bugs.
- Running **shouldComponentUpdate** on every update can slow down the application, especially when there are too many components with deep nested contexts.
- Debugging becomes difficult from the combination of **shouldComponentUpdate** and **Context** and may be difficult to trace the root cause of a re-rendering problem.

Using React's built in `React.memo` or hooks like `useMemo` and `useCallback` are some of the safer approaches to handle optimization and memoization.

## Question 3

Describe 3 ways to pass _information_ from a component to its PARENT.

## Answer

Passing information from a child components to their parent can be achieved using either of the methods described below:

- Using **Props** and **Callbacks** - this method involves passing a callback function from the parent component to the child component as a prop. The child component can invoke this callback function with the necessary data or information as argument. The parent can then receive this information and use it for something else.
  <br>
  Example:

```
  import React, { useState } from 'react';
  import ChildComponent from './ChildComponent';

  function ParentComponent() {
    const [dataFromChild, setDataFromChild] = useState('');

    const handleChildData = (data) => {
      setDataFromChild(data);
    };

    return (
      <div>
        <ChildComponent onData={handleChildData} />
        <p>Data from Child: {dataFromChild}</p>
      </div>
    );
  }
```

```
  import React from 'react';

  function ChildComponent({ onData }) {
    const handleClick = () => {
      const data = 'Information from Child';
      onData(data);
    };

    return (
      <div>
        <button onClick={handleClick}>Pass Data to Parent</button>
      </div>
    );
  }
```

- Using **React Context API** - this method involves creating a global state that can be accessed and modified by components at different levels of the component tree. The parent defines the context and provides a way for the child components to consume or make modifications using a **Provider** and **Consumer**.
  <br>
  Example
  <br>

```
  import React, { createContext, useState } from 'react';
  import ChildComponent from './ChildComponent';

  const MyContext = createContext();

  function ParentComponent() {
    const [dataFromChild, setDataFromChild] = useState('');

    return (
      <MyContext.Provider value={{ dataFromChild, setDataFromChild }}>
        <ChildComponent />
        <p>Data from Child: {dataFromChild}</p>
      </MyContext.Provider>
    );
  }
```

```
  import React, { useContext } from 'react';
  import MyContext from './MyContext';

  function ChildComponent() {
    const { setDataFromChild } = useContext(MyContext);

    const handleClick = () => {
      const data = 'Information from Child';
      setDataFromChild(data);
    };

    return (
      <div>
        <button onClick={handleClick}>Pass Data to Parent</button>
      </div>
    );
  }
```

- Using **State Management Libraries** - such as Redux, Mobx, etc. allows to manage global application state independently of component hierarchy. Actions can be dispatched from child components and handle them in reducers, updating the store. The parent component subscribes to the changes in the store and reacts to updates as needed.
  <br>
  Example
  <br>

```
  import React from 'react';
  import { useSelector, useDispatch } from 'react-redux';
  import { setDataFromChildAction } from '../redux/actions';

  function ParentComponent() {
    const dataFromChild = useSelector((state) => state.dataFromChild);
    const dispatch = useDispatch();

    return (
      <div>
        <ChildComponent />
        <p>Data from Child: {dataFromChild}</p>
      </div>
    );
  }

```

```
  import React from 'react';
  import { useDispatch } from 'react-redux';
  import { setDataFromChildAction } from '../redux/actions';

  function ChildComponent() {
    const dispatch = useDispatch();

    const handleClick = () => {
      const data = 'Information from Child';
      dispatch(setDataFromChildAction(data));
    };

    return (
      <div>
        <button onClick={handleClick}>Pass Data to Parent</button>
      </div>
    );
  }

```

Using each of these approaches depends on the complexity and scale of the application. For example, it is advisable to use props and callbacks for simple communication between parent and child components, and for complex state management and sharing data across different parts of the applicaton, it is advisable to use Context API or state management libraires like Redux.

## Question 4

Give 2 ways to prevent components from re-rendering.

## Answer

React Components can be prevented from re-rendering by using memoization techniques and React lifecycle methods. Two ways to achieve this are:

- Using `React.memo` - a higher-order component (HOC) that memoizes a component, preventing it from unncessary re-renders when there is no change in the component's props. This HOC works only in React functional components.
  <br>
  Example:

  ```
  import React from 'react';

  const MyComponent = React.memo(({ prop1, prop2 }) => {
    // Component logic
    return (
      <div>
        {/* JSX */}
      </div>
    );
  });
  ```

In the example above, the component **MyComponent** will only re-render if **prop1** and **prop2** changes, else, it will reuse the previously rendered result, improving performance.

- Using `shouldComponentUpdate` - this React lifecycle method is present in only class component. It is used to manually control whether a component should re-render or not. This method will always return true by default, indicating that the component should always re-render. Custom logic can be implemented inside this lifecycle method to compare the current props and state with the next to determine whether to proceed with the update.
  <br>
  Example:

```
  import React, { Component } from 'react';

  class MyComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
      // Implement custom logic here to compare current
      // props and state with nextProps and nextState.
      // Return true if the component should re-render,
      // or false to prevent re-rendering.

      return nextProps.prop1 !== this.props.prop1 || nextProps.prop2 !== this.props.prop2;
    }

    render() {
      // Component logic
      return (
        <div>
          {/* JSX */}
        </div>
      );
    }
  }

```

Defining this method can control the way a component should re-render, helping to optimize performance of applications.

## Question 5

What is a fragment and why do we need it? Give an example where it might break my app.

## Answer

Fragments in React are used to group multiple child elements without the need to add an extra node to the DOM. They return multiple elements from a componen's render method without the need to wrap them in a single parent element. They were introduced in React 16.2 to curb the issue of having unnecessary wrapper elements when returning multiple components from the render method.
Fragments can be imported from React, **<React.Fragment>...</React.Fragment>**" or by using the shorthand "**<>...</>**".

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

- Avoid extra DOM elements - Keeps the HTML structure cleaner and more efficient when no unnecessary extra node is added to the DOM.
- Grouping elements - Fragments are needed to group multiple elements without the need to introduce a new parent element. Useful in cases where there is the need to map over a list of items and render them without adding any enclosing element.

<br>
Example where using Fragments can break an app:

```
import React from 'react';

const MyComponent = () => {
  const showTitle = true;

  return (
    <>
      {showTitle && <h1>Title</h1>}
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
};

```

In the example above, the `<h1>` element will be rendered because `showTitle` is set to true. However, because the `<h1>` element is not wrapped in a parent element, rendering it just like that could lead to invalid HTML structure. If `showTitle` is false, there will not be any problem since no element will be rendered.

Solving this issue can be done by always making sure that conditionally rendered elements are wrapped in a parent element before using fragments to maintain the HTML structure.
<br>
Exampple

```
import React from 'react';

const MyComponent = () => {
  const condition = true;

  return (
    <>
      {condition && (
        <div>
          <h1>Title</h1>
        </div>
      )}
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
};

```

## Question 6

Give 3 examples of the HOC pattern.

## Answer

Higher-Order Components (HOCs) are functions that takes a component as an argument and return an enhanced version of that component. They are design pattern in React used to extend the functionality of a component by wrapping it with another component.
<br>
Examples of HOC pattern used in React:

- `withAuth` HOC for adding authentication functionality to components to check if a user is authenticated. If true, the component is rendered, else, the user can be redirected to another page.

```
  import React from 'react';

  const withAuth = (WrappedComponent) => {
    const isAuthenticated = true; // Replace with authentication logic

    return class extends React.Component {
      render() {
        if (isAuthenticated) {
          return <WrappedComponent {...this.props} />;
        } else {
          return <p>Please log in to view this content.</p>;
        }
      }
    };
  };

  // Usage:
  const MyComponent = () => {
    return <div>Authenticated Content</div>;
  };

  const AuthenticatedComponent = withAuth(MyComponent);

```

- `withLoading` HOC to add a loading indicator to a component. It displays a loading message while data is being fetched or processed.

```
  import React from 'react';

  const withLoading = (WrappedComponent) => {
    return class extends React.Component {
      state = {
        isLoading: true,
      };

      componentDidMount() {
        // Simulate loading data from an API
        // or performing some async operation
        setTimeout(() => {
          this.setState({ isLoading: false });
        }, 2000);
      }

      render() {
        if (this.state.isLoading) {
          return <p>Loading...</p>;
        } else {
          return <WrappedComponent {...this.props} />;
        }
      }
    };
  };

  // Usage:
  const MyComponent = () => {
    return <div>Data Loaded Successfully</div>;
  };

  const ComponentWithLoading = withLoading(MyComponent);

```

- `withLogger` HOC to log some events and lifecycle methods of a component to help in monitoring and debugging.

```
  import React from 'react';

  const withLogger = (WrappedComponent) => {
    return class extends React.Component {
      componentDidMount() {
        console.log('Component has mounted');
      }

      componentDidUpdate(prevProps) {
        console.log('Component updated. Previous props:', prevProps);
      }

      componentWillUnmount() {
        console.log('Component will unmount');
      }

      render() {
        return <WrappedComponent {...this.props} />;
      }
    };
  };

  // Usage:
  const MyComponent = () => {
    return <div>Component with Logging</div>;
  };

  const ComponentWithLogging = withLogger(MyComponent);

```

## Question 7

What's the difference in handling exceptions in promises, callbacks and async…await?

## Answer

Exceptions are handled differently in terms of behavior and syntax when using `Promises`, `callbacks`, and `async...await`.

- In `Promises`, exceptions are handled using the `.catch()` method. They are able to "catch" errors that are "thrown" or rejected by the `.then()` method. It is also easier to chain multiple `.then()` and `.catch()` methods to handle different scenarios.

```
  myPromiseFunction()
    .then((result) => {
      // Handle resolved Promise
    })
    .catch((error) => {
      // Handle rejected Promise
    });

```

- In `Callbacks`, exceptions are handled as the first argument in the callback function.This argument is reserved for the error, and the subsequent arguments contains the results. This pattern is complex and challenging to manage when multiple asynchronous operations are involved.

```
  function myCallbackFunction(callback) {
    // Asynchronous operation
    if (errorOccurred) {
      callback(new Error('Error message'));
    } else {
      callback(null, resultData);
    }
  }

  myCallbackFunction((error, result) => {
    if (error) {
      // Handle error
    } else {
      // Handle result
    }
  });

```

- In `async...await`, exceptions are handled in a `try...catch` block. When an exception is thrown within the `async` function, it can be caught using a surrounding `try...catch` block. The `await` keyword pauses the execution of the `async` function until the promise is resolved or rejceted. This method provides more cleaner way to handle asynchronous code.

```
  async function myAsyncFunction() {
    try {
      const result = await myPromiseFunction();
      // Handle resolved Promise
    } catch (error) {
      // Handle rejected Promise or any other error
    }
  }

```

## Question 8

How many arguments does setState take and why is it async.

## Answer

The `setState` method in React is used to update the state of a component, and it takes two arguments: an **object** or a **function** and an optional **callback** function.

The `object` argument has keys which represents the state properties needed to be updated, and the values represents the new values for those properties.

```
this.setState({ key1: value1, key2: value2 });
```

A `function` argument receives the previous state and props as arguments and returns the new state object.

```
this.setState((prevState, props) => {
  // Calculate and return the new state object based on prevState and/or props
  return { key1: value1, key2: value2 };
});
```

The optional `callback` will be executed after the state update is complete and the component has re-rendered.

```
this.setState({ key1: value1 }, () => {
  // Code to be executed after the state update and re-render
});

```

React `setState` method is asynchronous for performance reasons. When the `setState` method is called, state is not updated, and component re-render trigger is not done immediately. Instead, it batches the updates and performs a single re-render with all the accumulated updates at the end of the current event loop. This means React reduces the number of times it needs to re-render the component to improve performance.

## Question 9

List the steps needed to migrate a Class to Function Component.

## Answer

Migrating from a Class component to a Function component in React involves the following steps:

- Remove lifecycle methods (e.g., `componentDidMount`, `componentDidUpdate`, etc.) in Class components because they are not needed in Function components.
- Remove the `constructor` if it is just setting the initial state.
- Replace the `state` object in the Class component with the `useState` hook in the Fucntion component.
- Convert instance methods in Class component to regular functions or use the `useCallback` hook for memoization (when needed).
- Remove the `this` reference since there is no instance of a class.
- Remove the `render()` method.
- Address differences in lifecycle methods (if necessary) - use its equivalent hooks (`useEffect`, `useLayoutEffect`, etc).
- Test the Function component to make sure everything works and behaves similar to the Class component.

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

- **Styled Components (CSS-in-JS)** - popular library that allows to write CSS directly inside JavaScript code. It uses tagged template literals to define styles for components. Other libraries include Emotion, Radium.

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

- **External CSS** - import CSS file into component or the main application file to be applied globally.

```
// styles.css
  .my-component {
    color: blue;
    font-size: 16px;
    font-weight: bold;
  }

```

```
// MyComponent.js
  import React from 'react';
  import './styles.css';

  const MyComponent = () => {
    return <div className="my-component">Component with external CSS</div>;
  };

```

## Question 11

How to render an HTML string coming from the server.

## Answer

Rendering HTML string that is received from a server can potentially lead to security vulnerabilities such as cross-site scripting (XSS) attacks and therefore needs to be done with caution. This can be achieved by:

- Making sure the HTML content comes from a trusted source and therefore safe.
- Use the `dangerouslySetInnerHTML` prop to render the HTML string.

```
  import React from 'react';

  const MyComponent = () => {
    // HTML string received from the server
    const htmlString = '<p>This is an HTML string from the server.</p>';

    // If you're sure the content is safe and trusted,
    // use dangerouslySetInnerHTML
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  export default MyComponent;

```

`dangerouslySetInnerHTML` should be used with caution as it poses security risks. HTML content should always be validated and sanitized when coming from a trusted source before using this approach.

- Convert the HTML to React elements manually or using Markdown rendering libraries such as `react-markdown` or `marked` to provide control and safety against potential security risks.
