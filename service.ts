export enum ActionBar {
    name = "bar",
    paramFoo = "foo",
}

export interface IActionBarParams {
    foo: string;
}

export enum FuncFoo {
    name = "foo",
    paramBar = "bar",
}

export interface IFuncFooParams {
    bar: string;
}

export enum EnumTest {
    one,
    two,
}

export enum Gender {
    male = "male",
    female = "female",
}

export interface IBar extends IManaged {
    BarString: string;
    Foo?: IFoo;
    Foo_FooId?: string;
}

export enum FooVInlineEnum {
    BarOne = 1,
    BarTwo = 2,
    BarThree = 3,
}

export interface IFoo extends IManaged {
    FooId: string;
    VInlineEnum: FooVInlineEnum;
    FooBool: boolean;
    FooEnum: unknown;
    FooDate: Date;
    FooTimestamp: Date;
    FooDateTime: Date;
    FooString: string;
    FooStringArray: string[];
    FooDouble: number;
    FooInteger: number;
    FooDecimal?: number;
    Bar?: IBar;
}

export interface IInher {
    InherTest: string;
}

export interface ITest extends IInher, IManaged {
    Test: string;
}

export interface IManaged {
    modifiedAt?: Date;
    createdAt?: Date;
    createdBy?: string;
    modifiedBy?: string;
}

export enum Entity {
    Bar = "TestService.Bar",
    Foo = "TestService.Foo",
    Inher = "TestService.Inher",
    Test = "TestService.Test",
    Managed = "managed",
}

