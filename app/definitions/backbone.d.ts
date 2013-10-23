// Type definitions for Backbone 1.0.0
// Project: http://backbonejs.org/
// Definitions by: Boris Yankov <https://github.com/borisyankov/>
// Definitions by: Natan Vivo <https://github.com/nvivo/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


/// <reference path="./jquery.d.ts" />

declare module Backbone {

    interface AddOptions extends Silenceable {
        at: number;
    }

    interface HistoryOptions extends Silenceable {
        pushState?: boolean;
        root?: string;
    }

    interface NavigateOptions {
        trigger: boolean;
    }

    interface RouterOptions {
      routes: {[route: string]: string;};
    }

    interface Silenceable {
        silent?: boolean;
    }

    interface Validable {
        validate?: boolean;
    }

    interface Waitable {
        wait?: boolean;
    }

    interface Parseable {
        parse?: boolean;
    }

    interface PersistenceOptions {
        url?: string;
        beforeSend?: (jqxhr: JQueryXHR) => void;
        success?: (modelOrCollection?: any, response?: any, options?: any) => void;
        error?: (modelOrCollection?: any, jqxhr?: JQueryXHR, options?: any) => void;
    }

    interface ModelSetOptions extends Silenceable, Validable {
    }

    interface ModelFetchOptions extends PersistenceOptions, ModelSetOptions, Parseable {
    }

    interface ModelSaveOptions extends Silenceable, Waitable, Validable, Parseable, PersistenceOptions {
        patch?: boolean;
    }

    interface ModelDestroyOptions extends Waitable, PersistenceOptions {
    }

    interface CollectionFetchOptions extends PersistenceOptions, Parseable {
        reset?: boolean;
    }

    class Events {
        on(eventName: string, callback?: (...args: any[]) => void , context?: any): Events;
        off(eventName?: string, callback?: (...args: any[]) => void , context?: any): Events;
        trigger(eventName: string, ...args: any[]): Events;
        bind(eventName: string, callback: (...args: any[]) => void , context?: any): Events;
        unbind(eventName?: string, callback?: (...args: any[]) => void , context?: any): Events;

        once(events: string, callback: (...args: any[]) => void , context?: any): Events;
        listenTo(object: any, events: string, callback: (...args: any[]) => void ): Events;
        listenToOnce(object: any, events: string, callback: (...args: any[]) => void ): Events;
        stopListening(object?: any, events?: string, callback?: (...args: any[]) => void ): Events;
    }

    class ModelBase extends Events {
        // url: any;
        // parse(response: any, options?: any): any;
        // toJSON(options?: any): any;
        // sync(...arg: any[]): JQueryXHR;
    }

    // interface OptionalDefaults<_Attributes> {
    //     defaults?(): _Attributes;
    // }

    class Model extends Events {

        static extend(properties: any, classProperties?: any): any; // do not use, prefer TypeScript's extend functionality

        url(): string;
        parse(response: any, options?: any): any;
        toJSON(): any;
        sync(...arg: any[]): JQueryXHR;

        defaults(): any;

        // attributes: _Attributes;
        // changed: _Attributes
        // cid: string;
        // id: any;
        idAttribute: string;
        validationError: string;
        urlRoot(): string;

        constructor(attributes?: any, options?: any);
        initialize(attributes?: any): void;

        fetch(options?: ModelFetchOptions): JQueryXHR;

        get(attributeName: string): any;
        set(attributeName: string, value: any, options?: ModelSetOptions): Model;
        set(obj: any, options?: ModelSetOptions): Model;

        // change(): any;
        changedAttributes(attributes?: any): any;
        clear(options?: Silenceable): Model;
        clone(): Model;
        destroy(options?: ModelDestroyOptions): Model;
        escape(attribute: string): string;
        has(attribute: string): boolean;
        hasChanged(attribute?: string): boolean;
        isNew(): boolean;
        isValid(): boolean;
        previous(attribute: string): any;
        previousAttributes(): any;
        save(attributes?: any, options?: ModelSaveOptions): JQueryXHR;
        unset(attribute: string, options?: Silenceable): Model;
        validate(attributes: any, options?: any): string;

        // _validate(attrs: any, options: any): boolean;

        // mixins from underscore

        keys(): string[];
        values(): any[];
        pairs(): any[][];
        invert(): {[value: string]: string;};
        pick(keys: string[]): any;
        pick(...keys: string[]): any;
        omit(keys: string[]): any;
        omit(...keys: string[]): any;
    }

  class Collection<_Model> extends Events {

        static extend(properties: any, classProperties?: any): any; // do not use, prefer TypeScript's extend functionality

        url(): string;
        parse(response: any, options?: any): any;
        toJSON(): any;
        sync(...arg: any[]): JQueryXHR;

        model: { new(attributes?: any, options?: any): _Model; };
        models: _Model[];
        // collection: Model;
        length: number;

        // constructor(models?: _Attributes[], options?: any);
        constructor(models?: _Model[], options?: any);

        fetch(options?: CollectionFetchOptions): JQueryXHR;

        // comparator(element: _Model): any;
        // comparator(compare: _Model, to?: _Model): number;
        comparator(compare: _Model, to: _Model): number;

        add(model: _Model, options?: AddOptions): Collection<_Model>;
        add(models: _Model[], options?: AddOptions): Collection<_Model>;
        at(index: number): _Model;
        get(id: any): _Model;
        create(attributes: any, options?: ModelSaveOptions): _Model;
        pluck(attribute: string): any[];
        push(model: _Model, options?: AddOptions): _Model;
        pop(options?: Silenceable): _Model;
        remove(model: _Model, options?: Silenceable): Collection<_Model>;
        remove(models: _Model[], options?: Silenceable): Collection<_Model>;
        reset(models?: _Model[], options?: Silenceable): Collection<_Model>;
        shift(options?: Silenceable): _Model;
        sort(options?: Silenceable): Collection<_Model>;
        unshift(model: _Model, options?: AddOptions): _Model;
        where(properies: any): _Model[];
        findWhere(properies: any): _Model;

        // _prepareModel(attrs?: any, options?: any): any;
        // _removeReference(model: _Model): void;
        // _onModelEvent(event: string, model: _Model, collection: Collection<Model>, options: any): void;

        // mixins from underscore

        all(iterator: (element: _Model, index: number) => boolean, context?: any): boolean;
        any(iterator: (element: _Model, index: number) => boolean, context?: any): boolean;
        collect(iterator: (element: _Model, index: number, context?: any) => any[], context?: any): any[];
        chain(): any;
        compact(): _Model[];
        contains(value: any): boolean;
        countBy(iterator: (element: _Model, index: number) => any): any[];
        countBy(attribute: string): any[];
        detect(iterator: (item: any) => boolean, context?: any): any; // ???
        difference(...model: _Model[]): _Model[];
        drop(): _Model;
        drop(n: number): _Model[];
        each(iterator: (element: _Model, index: number, list?: any) => void , context?: any): any;
        every(iterator: (element: _Model, index: number) => boolean, context?: any): boolean;
        filter(iterator: (element: _Model, index: number) => boolean, context?: any): _Model[];
        find(iterator: (element: _Model, index: number) => boolean, context?: any): _Model;
        first(): _Model;
        first(n: number): _Model[];
        flatten(shallow?: boolean): _Model[];
        foldl(iterator: (memo: any, element: _Model, index: number) => any, initialMemo: any, context?: any): any;
        forEach(iterator: (element: _Model, index: number, list?: any) => void , context?: any): any;
        include(value: any): boolean;
        indexOf(element: _Model, isSorted?: boolean): number;
        initial(): _Model;
        initial(n: number): _Model[];
        inject(iterator: (memo: any, element: _Model, index: number) => any, initialMemo: any, context?: any): any;
        intersection(...model: _Model[]): _Model[];
        isEmpty(object: any): boolean;
        invoke(methodName: string, arguments?: any[]): any;
        last(): _Model;
        last(n: number): _Model[];
        lastIndexOf(element: _Model, fromIndex?: number): number;
        map(iterator: (element: _Model, index: number, context?: any) => any[], context?: any): any[];
        max(iterator?: (element: _Model, index: number) => any, context?: any): _Model;
        min(iterator?: (element: _Model, index: number) => any, context?: any): _Model;
        object(...values: any[]): any[];
        reduce(iterator: (memo: any, element: _Model, index: number) => any, initialMemo: any, context?: any): any;
        select(iterator: any, context?: any): any[];
        size(): number;
        shuffle(): any[];
        some(iterator: (element: _Model, index: number) => boolean, context?: any): boolean;
        sortBy(iterator: (element: _Model, index: number) => number, context?: any): _Model[];
        sortBy(attribute: string, context?: any): _Model[];
        sortedIndex(element: _Model, iterator?: (element: _Model, index: number) => number): number;
        range(stop: number, step?: number): any;
        range(start: number, stop: number, step?: number): any;
        reduceRight(iterator: (memo: any, element: _Model, index: number) => any, initialMemo: any, context?: any): any[];
        reject(iterator: (element: _Model, index: number) => boolean, context?: any): _Model[];
        rest(): _Model;
        rest(n: number): _Model[];
        tail(): _Model;
        tail(n: number): _Model[];
        toArray(): any[];
        union(...model: _Model[]): _Model[];
        uniq(isSorted?: boolean, iterator?: (element: _Model, index: number) => boolean): _Model[];
        without(...values: any[]): _Model[];
        zip(...model: _Model[]): _Model[];
    }

    interface OptionalRoutes {
        routes?(): any;
    }

    class Router extends Events implements OptionalRoutes {

        static extend(properties: any, classProperties?: any): any; // do not use, prefer TypeScript's extend functionality

        constructor(options?: RouterOptions);
        initialize(options?: RouterOptions): any;
        route(route: string, name: string, callback?: (...parameter: any[]) => void ): any;
        navigate(fragment: string, options?: NavigateOptions): any;
        navigate(fragment: string, trigger?: boolean): any;

        _bindRoutes(): void;
        _routeToRegExp(route: string): RegExp;
        _extractParameters(route: RegExp, fragment: string): string[];
    }

    var history: History;

    class History extends Events {

        handlers: any[];
        interval: number;

        start(options?: HistoryOptions): any;

        getHash(window?: Window): string;
        getFragment(fragment?: string, forcePushState?: boolean): string;
        stop(): void;
        route(route: string, callback: (...args: any[]) => void ): any;
        checkUrl(e?: any): void;
        loadUrl(fragmentOverride: string): boolean;
        navigate(fragment: string, options?: any): any;
        started: boolean;

        _updateHash(location: Location, fragment: string, replace: boolean): any;
    }

    interface ViewOptions {
        model?: Backbone.Model;
        collection?: Backbone.Collection<Model>;
        el?: any;
        $el?: JQuery;
        id?: string;
        className?: string;
        tagName?: string;
        attributes?: any[];
    }

    interface OptionalEvents {
        events?(): any;
    }

    class View extends Events implements OptionalEvents {

        static extend(properties: any, classProperties?: any): any;  // do not use, prefer TypeScript's extend functionality

        constructor(options?: ViewOptions);

        $(selector: string): JQuery;
        model: Model;
        collection: Collection<Model>;
        make(tagName: string, attrs?: any, opts?: any): View;
        setElement(element: HTMLElement, delegate?: boolean): any;
        setElement(element: JQuery, delegate?: boolean): any;
        id: string;
        cid: string;
        className: string;
        tagName: string;
        options: any;

        el: any;
        $el: JQuery;
        attributes: any;
        // $(selector: any): JQuery;
        render(): View;
        remove(): View;
        make(tagName: any, attributes?: any, content?: any): any;
        delegateEvents(events?: any): any;
        undelegateEvents(): any;

        // _ensureElement(): void;
    }

    // SYNC
    function sync(method: string, model: any, options?: JQueryAjaxSettings): any;
    var emulateHTTP: boolean;
    var emulateJSONBackbone: boolean;

    // Utility

    // 0.9 cannot return modules anymore, and "typeof <Module>" is not compiling for some reason
    // returning "any" until this is fixed

    //function noConflict(): typeof Backbone;
    function noConflict(): any;

    function setDomLibrary(jQueryNew: any): any;
}

