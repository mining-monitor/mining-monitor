
export const path = {
    getQuery: (name: string) => {
        const param = `${name}=`
        if (location.href.indexOf(param) === -1) {
            return ""
        }

        let query = location.href.substring(location.href.indexOf(param))
        query = query.substring(param.length)

        if(query.indexOf("&") !== -1) {
            query = query.substring(0, query.indexOf("&"))
        }

        return query
    }
}