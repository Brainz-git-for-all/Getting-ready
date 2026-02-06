package com.brainz.links.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface  UserRepository extends JpaRepository<User , Long> {
    User findByUserName(String userName);
    boolean existByUserName(String userName);
}
