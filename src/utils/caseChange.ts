export function snakeCaseToTitleCase(str: string) {
    return str.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', ' ')
    })
}