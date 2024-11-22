export class UserEntity {
    id?: number;
    email?: string;
    password?: string;

    constructor(partial: Partial<UserEntity> = {}) {
        if (partial.id !== undefined) this.id = partial.id;
        if (partial.email !== undefined) this.email = partial.email;
        if (partial.password !== undefined) this.password = partial.password;
    }
}
