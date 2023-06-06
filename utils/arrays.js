export function groupBy(source, transform) {
    return source.reduce((acc, item) => {
        acc[transform(item)] = item;
        return acc;
    }, {});
}
//# sourceMappingURL=arrays.js.map