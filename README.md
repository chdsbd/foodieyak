# foodieyak


Data modeling thoughts:

/users/{user}/places/{place}


/place/{place}



## places as a subcollection

### list all places

for each friend:
	query(/users/{friend}/places)


### get place

We need the friendID of the owner and the placeId. Eww


## places as a top level collection


### list all places

/place/{place}
createdByUserId: string

query(/place, where(createdByUserId, "==", [self, ...friendIds]))

