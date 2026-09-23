// interface declares clone() returning its own type; Circle implements it to copy itself instead of being rebuilt from scratch
interface Shape {
    Shape clone();
    void draw();
}

class Circle implements Shape {
    private final int radius;

    Circle(int radius) {
        this.radius = radius;
    }

    public Circle clone() {
        return new Circle(this.radius);
    }

    public void draw() {
        System.out.println("Circle r=" + radius);
    }
}

// abstract class declares clone() returning its own type; Dog extends it to copy itself instead of being rebuilt from scratch
abstract class Animal {
    abstract Animal clone();
    abstract String describe();
}

class Dog extends Animal {
    private final String name;

    Dog(String name) {
        this.name = name;
    }

    public Dog clone() {
        return new Dog(this.name);
    }

    public String describe() {
        return "Dog: " + name;
    }
}

// another interface/implementation pair with the same clone() contract, different domain
interface Document {
    Document clone();
    String save();
}

class TextDocument implements Document {
    private final String content;

    TextDocument(String content) {
        this.content = content;
    }

    public TextDocument clone() {
        return new TextDocument(this.content);
    }

    public String save() {
        return "Saved: " + content;
    }
}
