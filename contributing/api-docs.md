# Writing API docs

We use [API extractor](https://api-extractor.com/pages/setup/generating_docs/) to generate API docs in markdown. We put the markdown files in the [theatre-docs](https://github.com/ariaminaei/theatre-docs/) repo, which also contains the tutorials and guides.

To generate the API docs, run the `build:api-docs` from the root of the repo:

```sh
$ yarn build:api-docs /path/to/theatre-docs/docs/api/ # this will empty the /api folder and regenerate the markdown files
```

## JSDoc/TSDoc gotchas

We are using TSDoc for documentation generation, IDEs use JSDoc for tooltips. TSDoc and JSDoc have subtle differences. We need to optimize for both.

* Most users will read our documentation inside their IDEs. 

### `@example`

IDEs automatically wrap example sections  in ``` if they aren't already. This means you can't use non-code explanations in example sections, like TSDoc examples do. 

Some IDEs have problems with multiple example sections.

WebStorm doesn’t highlight examples if they are wrapped in ```.

api-documenter doesn’t highlight examples if they aren’t wrapped in ```.

### Guidelines

- Only use one `@example` section
- Use a single code block in it, no explanations
- Wrap the code block in ```ts ... ```
- If you need to explain the code, use code comments

#### `@typeParam`

api-documenter doesn’t generate documentation for it.

#### `@link`

While in JSDoc you can specify paths relative to the current declaration, TSDoc requires everything to be specified relative to the entry point. That is, if `bar` is a member of `Foo`, and `Foo` is exported in the entry, you need to refer to `bar` as `Foo.bar`, even inside `Foo`.

JSDoc allows separating the link text from the link either with a space or using “|”. TSDoc only supports “|”, *and* you mustn’t have spaces around it. So for example `{@link MyClass | go here}` would be rendered incorrectly, whereas `{@link MyClass|go here}` would be correct.

#### `@param`

api-documenter won’t render the documentation for object properties, but document them anyway, IDEs do.

Since documentation is only rendered for the object and not for its properties, make sure to include examples for these properties.

#### `@see`

The `@see` tag is not rendered by api-documenter.