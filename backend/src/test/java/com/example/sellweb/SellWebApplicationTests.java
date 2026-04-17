package com.example.sellweb;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import com.example.sellweb.security.JwtUtils;
import com.example.sellweb.service.AdminDashboardService;
import com.example.sellweb.service.AuthService;
import com.example.sellweb.service.CategoryService;
import com.example.sellweb.service.ContactService;
import com.example.sellweb.service.HomeConfigService;
import com.example.sellweb.service.HomeSectionService;
import com.example.sellweb.service.ProductService;
import com.example.sellweb.service.SiteSettingService;
import com.example.sellweb.service.UploadService;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude="
                + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
})
class SellWebApplicationTests {

    @MockBean
    private AuthService authService;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private ContactService contactService;

    @MockBean
    private HomeConfigService homeConfigService;

    @MockBean
    private HomeSectionService homeSectionService;

    @MockBean
    private ProductService productService;

    @MockBean
    private SiteSettingService siteSettingService;

    @MockBean
    private UploadService uploadService;

    @MockBean
    private AdminDashboardService adminDashboardService;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void contextLoads() {
    }
}
