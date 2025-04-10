export type Request = {
    
}

export type Response = {
    accessToken: string,
    clientToken: string,
    selectedProfile: {
        id: string,
        name: string,
        properties: {
            name: string,
            value: string
        }[]
    },
    availableProfiles: {
        id: string,
        name: string,
        properties: {
            name: string,
            value: string
        }[]
    }[],
}