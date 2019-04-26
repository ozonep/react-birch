# React Birch Demo

This repository implements a tree view component on top of [`react-birch`](https://github.com/tinialabs/react-birch), a library for rendering nested trees in React apps.

All the UI features you expect from a filetree are available out-of-the-box, for example:
 - Expand/Collapse folders
 - Drag and Drop items/folders
 - Keyboard shorcuts (Arrow up/down/left/right, Enter, F2, etc.)
 - Inline item renaming and creation
 - A styling system
 - Context menu interactions

<div>
    <img src="https://i.imgur.com/94wkW8q.gif" width="350" alt="Birch filetree animated demo" style="float: left;margin-right: 10px;margin-bottom: 10px;">
    <div style="display: inline-block;">
        <div>
          <img src="https://i.imgur.com/cTtXhow.gif" width="350" alt="Birch filetree animated demo" style="display: block">
          <h4>Inline renaming</h4>
      </div>
      <div>
        <img src="https://i.imgur.com/DSTJCeD.gif" width="350" alt="Birch filetree animated demo">
        <h4>Inline item creation</h4>
      </div>
    </div>
    <div style="clear: both"></div>
</div>

## Performance

> *(forked from `react-aspen` and no other implementation has outperformed `react-aspen` as far as raw numbers are concerned)*

A large part of the performance edge comes from the fact that `react-aspen` and `react-birch` use virtualization/windowing to render trees instead of a nested DOM node structure.

Here's a section taken from [reactjs.org]() that describes windowing in detail:

> If your application renders long lists of data (hundreds or thousands of rows), we recommended using a technique known as “windowing”. This technique only renders
a small subset of your rows at any given time, and can dramatically reduce the time it takes to re-render the components as well as the number of DOM nodes created.

This also allows browsers to chillout since they no longer have to do extensive bookkeeping of extensive number of DOM nodes.

## Usage

This repo lives as a base template for developers who want to incorporate a `TreeView` in their apps (electron/webapps). Unlike the core engine, `react-birch`, this isn't published on `npm` as a package
by design. Part of the reason is to emphasize on the customization part of `react-birch`, something we want the developer to be in full control of.

So to integrate a filetree in your app, either extract the contents of `src/` to some folder in your codebase and call it a day, or, add this repository as a git submodule.
The problem with former option is that you'll loose all the "git'ty" features from that point on, meaning you won't get any changes made in the upstream branch without having
to manually copy/paste stuff.

## License

This repository is licensed under MIT license. 