export class Counter {
    constructor({
        id = `id_${Date.now()}`,
        name = "Neuer Counter",
        value = 0,
        updatedAt = null,
        resetEnabled = true,
        resetInterval = "daily",
    } = {}) {
        this.id = id;
        this.name = name;
        this.value = value;
        this.updatedAt = updatedAt;
        this.resetEnabled = resetEnabled;
        this.resetInterval = resetInterval;
    }

    increment() {
        this.value++;
        this.updateTimestamp();
        return this.value;
    }

    decrement() {
        if (this.value > 0) {
            this.value--;
            this.updateTimestamp();
        }
        return this.value;
    }

    reset() {
        this.value = 0;
        this.updateTimestamp();
        return this.value;
    }

    updateTimestamp() {
        this.updatedAt = new Date().toISOString();
    }

    checkDailyReset() {
        if (
            !this.resetEnabled ||
            this.resetInterval !== "daily" ||
            !this.updatedAt
        ) {
            return false;
        }

        const lastDate = new Date(this.updatedAt);
        const today = new Date();

        const lastDay = new Date(
            lastDate.getFullYear(),
            lastDate.getMonth(),
            lastDate.getDate()
        );

        const currentDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        if (currentDay > lastDay) {
            this.value = 0;
            this.updateTimestamp();
            return true;
        }

        return false;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            value: this.value,
            updatedAt: this.updatedAt,
            resetEnabled: this.resetEnabled,
            resetInterval: this.resetInterval,
        };
    }

    static fromJSON(data) {
        return new Counter(data);
    }
}