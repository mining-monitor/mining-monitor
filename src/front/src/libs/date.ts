export const date = {
    format: (value: Date) => {
        return `${formatValue(value.getDate())}.${formatValue(value.getMonth())}.${value.getFullYear()}`
        + ` ${formatValue(value.getHours())}:${formatValue(value.getMinutes())}`
    }
}

const formatValue = (value: number) => value < 10 ? `0${value}` : value.toString()