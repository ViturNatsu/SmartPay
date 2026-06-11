public class Counter {
    public int count;
    
    public Counter() {
        this.count = 0;
    }

    public void increment() {
        count ++;

    }
    public void decrement() {
        count --;

    }
    public int getCount() {
        return count;
    }
}

public class Runner {
    public static void main(String[] args) {

    Thread worker1 = new Thread (() -> {
        for (int i = 0; i < 50; i++) {
            counter.increment();
        }
    });
    Thread worker2 = new Thread (() -> {
        for (int i = 0; i < 50; i++) {
            counter.increment();
        }
    });
    worker1.start();
    worker2.start();

    System.out.println(counter.getCount());
}

}