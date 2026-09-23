// PROTOTYPE (pos): interface declares clone() returning its own type; Circle implements it to copy itself instead of being rebuilt from scratch
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
