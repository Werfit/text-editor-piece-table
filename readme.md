# Text Editor

It's a simple implementation of a text editor (maybe more like a **textarea** element in HTML). It supports inserting and deleting text, range selection and mouse selection.

## Installation

Clone the repository, run `pnpm install` and `pnpm run dev`. If you have no other processes on the port **5173**, you will be able to see the application on `localhost:5173`

## Purpose

Being inspired by this [article](https://austinhenley.com/blog/challengingprojects.html), I started researching how I can implement a text editor. Most of the articles I've found did it using a string array for text manipulation.

This [repo](https://github.com/grassator/canvas-text-editor-tutorial) was a lot of help, so I decided to take it as an example and make a text editor that uses Piece Table structure instead of the string array.
