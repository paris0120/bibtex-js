import {isArray, isNumber} from "../../../util";
import {AuthorName, parseAuthorName} from "./Author";
import {isOuterQuotedString} from "../../datatype/string/QuotedString";
import {BibOuterStringComponent} from "../../datatype/string/BibStringComponent";
import {BibStringData} from "../../datatype/string/BibStringData";
import {
    flattenQuotedStrings,
    globContiguousStrings,
    isContiguousSimpleString,
    joinContiguousSimpleStrings,
    splitOnAnd
} from "../../datatype/string/bib-string-utils";
import {FieldValue} from "../../datatype/KeyVal";


/**
 * Represents a list of authors
 */
export class Authors extends BibOuterStringComponent {
    readonly authors$: AuthorName[];

    constructor(fieldValue: FieldValue) {
        const data = isNumber(fieldValue) ? [fieldValue] : fieldValue.data;
        super("authors", data);

        const authorNames = determineAuthorNames$(fieldValue);
        this.authors$ = authorNames.map(name => parseAuthor(name));
    }
}


function parseAuthor(data: BibStringData) {
    return parseAuthorName(data);
}


export function determineAuthorNames$(data: FieldValue): BibStringData[] {
    if (isNumber(data)) {
        return determineAuthorNames([data]);
    } else {
        return determineAuthorNames(data.data, isOuterQuotedString(data));
    }
}


function determineAuthorNames(data: BibStringData, hideQuotes?: boolean): BibStringData[] {
    const globbed = globContiguousStrings(
        flattenQuotedStrings(data, hideQuotes)
    );
    const normalizedString: BibStringData = globbed.map(e => isContiguousSimpleString(e) ? joinContiguousSimpleStrings(e) : e);
    return splitOnAnd(normalizedString);
}


export function mustBeAuthors(x: any): Authors {
    if (!isAuthors(x)) throw new Error();
    return x;
}


export function isAuthors(x: any): x is Authors {
    return (isArray(x["authors$"]) && x.type === "authors");
}
