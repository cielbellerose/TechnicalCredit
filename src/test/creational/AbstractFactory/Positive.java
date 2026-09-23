// top-level interface declares one factory method per product family member; concrete factories implement it to produce a matched set of concrete products
interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class WinFactory implements GUIFactory {
    public Button createButton() {
        return new WinButton();
    }

    public Checkbox createCheckbox() {
        return new WinCheckbox();
    }
}

class MacFactory implements GUIFactory {
    public Button createButton() {
        return new MacButton();
    }

    public Checkbox createCheckbox() {
        return new MacCheckbox();
    }
}

// abstract product interface; concrete products implement it, one per concrete factory
interface Button {
    void paint();
}

class WinButton implements Button {
    public void paint() {
        System.out.println("Windows button");
    }
}

class MacButton implements Button {
    public void paint() {
        System.out.println("Mac button");
    }
}

// second abstract product interface, completing the related family GUIFactory produces
interface Checkbox {
    void paint();
}

class WinCheckbox implements Checkbox {
    public void paint() {
        System.out.println("Windows checkbox");
    }
}

class MacCheckbox implements Checkbox {
    public void paint() {
        System.out.println("Mac checkbox");
    }
}
