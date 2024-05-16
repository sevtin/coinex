export interface IMenu {
    Id: number
    Color: string
    SelectedColor: string
    Text: string
    FontSize: string
    Selected: boolean
    Entered: boolean
    Path: string
}


function newMenu(id: number, name: string, path: string): IMenu {
    return {
        Id: id,
        Color: "#ffffff",
        SelectedColor: "#ffffff",
        Text: name,
        FontSize: "14px",
        Selected: false,
        Entered: false,
        Path: path
    }
}