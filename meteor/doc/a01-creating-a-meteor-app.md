## Creating the Meteor App

This is a good tutorial on routing, [Leveling Up With React: React Router]. Now this is ReactRouter v3, the new ReactRouter v4 is out now, as of this reading is v4.1.1, CSS Tricks does a very good job in explaining ReactRouter's philosophy, it's a recommended reading, but v4 does not work as v3. This are the links to tutorials on the new version.

-   [Meteor Chef - Getting Started with React Router 4]
-   [React Router Documentation]
-   [Nesting in ReactRouter v4]
-   [Quick tut to ReactRouter 4]

This is the installation process for a Meteor app with React.

```bash
meteor create myAppName
cd myAppName
meteor npm install
meteor npm install --save react react-dom
meteor npm install --save bootstrap
```

For the installation and setup of `react-router` we follow this steps [React Router Basics]. (Not really, we use v4)

```bash
meteor npm install --save react-router react-router-dom
```

On the `client` folder the `main.html` file looks like this:

```html
<head>
    <title>myAppName</title>
</head>

<body>
   <div id="react-root"></div>
</body>
```

On the `client` folder the `main.js` file looks like this:
```javascript
import '/imports/startup/client';
```

We create a layout in `/imports/ui/layouts/App/` and we put in a `App.js` file.

## Collections Definition

The pattern we follow for the definition of collections is here, [Defining MongoDB Collections].


[Leveling Up With React: React Router]: https://css-tricks.com/learning-react-router/
[Meteor Chef - Getting Started with React Router 4]: https://themeteorchef.com/tutorials/getting-started-with-react-router-v4
[React Router Documentation]: https://reacttraining.com/react-router/web/guides/quick-start
[Nesting in ReactRouter v4]: https://teamtreehouse.com/community/warning-you-should-not-use-route-component-and-route-children-in-the-same-route-route-children-will-be-ignored
[Quick tut to ReactRouter 4]: https://medium.com/@pshrmn/a-simple-react-router-v4-tutorial-7f23ff27adf˚
[React Router Basics]: https://themeteorchef.com/tutorials/react-router-basics
[Defining MongoDB Collections]: https://themeteorchef.com/tutorials/defining-mongodb-collections
