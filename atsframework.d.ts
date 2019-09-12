declare namespace atsframework {

    export abstract class FrameworkModule {
        static update(elapsed: number, realElapsed: number): void;
        static shutdown(): void;
    }

}